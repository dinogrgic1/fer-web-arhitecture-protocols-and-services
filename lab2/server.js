const bodyParser = require("body-parser");
const express = require('express');
const cors = require('cors');
const ws = require('ws')

const EventEmitter = require('events');

const port = 5000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

let last_messages = {};
let connections = {};

const server = app.listen(port, () => {
    console.log(`Chat listening on port ${port}`)
});

const POLLING = 1
const LONG_POLLING = 2
const WEB_SOCKET = 3

const wss = new ws.WebSocket.Server({ server });;

wss.on('connection', (ws, req) => {
    let params = new URLSearchParams(req.url.substring(2));
    const username = params.get('username');
    connections[username] = { "type": WEB_SOCKET, "target": ws };
    ws.send(JSON.stringify(collectMessages(username)));
});

app.post('/messages_poll', (req, res) => {
    connections[req.body.username] = { "type": POLLING };
    let messages = collectMessages(req.body.username);
    res.send(JSON.stringify(filterMessages(messages, req.body.last_message)));
})

app.post('/messages_long_poll', (req, res) => {
    const eventEmitter = new EventEmitter();
    eventEmitter.on('message', (username) => {
        res.end(JSON.stringify([last_messages[username]]));
    });
    connections[req.body.username] = { "type": LONG_POLLING, "target": eventEmitter };
    let messages = collectMessages(req.body.username);
    res.send(JSON.stringify(filterMessages(messages, req.body.last_message)));
});

app.post('/message', (req, res) => {
    last_messages[req.body.username] = req.body;
    for (const item of Object.keys(connections)) {
        if (item == req.body.username) {
            continue;
        }

        switch (connections[item].type) {
            case POLLING:
                break;
            case LONG_POLLING:
                connections[item].target.emit('message', req.body.username);
                break;
            case WEB_SOCKET:
                connections[item].target.send(JSON.stringify([req.body]));
                break;
            default:
                res.status(500).send({ error: `Wrong messaging mode ${connections[item].type}!` })
        }
    }
    res.send()
});

function collectMessages(myUsername) {
    let messages = [];
    for (const otherUsername in last_messages) {
        if (myUsername == otherUsername) {
            continue;
        }
        messages.push(last_messages[otherUsername]);
    }
    return messages;
}

function filterMessages(messages, lastTimestampClient) {
    let filtered_messages = [];
    for (const idx in messages) {
        if (lastTimestampClient >= messages[idx].timestamp) {
            continue;
        }
        filtered_messages.push(messages[idx]);
    }
    return filtered_messages;
}