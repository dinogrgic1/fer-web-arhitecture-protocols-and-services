const bodyParser = require("body-parser");
const express = require('express');
const cors = require('cors');
const ws = require('ws')

const EventEmitter = require('events');

const port = 5000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

let last_messages = {};
let logged_users = new Set();
const eventEmitter = new EventEmitter();
let connections = {};

const server = app.listen(port, () => {
    console.log(`Chat listening on port ${port}`)
});

const wss = new ws.WebSocket.Server({ server });;

wss.on('connection', (ws, req) => {
    let params = new URLSearchParams(req.url.substring(2));
    const username = params.get('username');
    logged_users.add(username);
    connections[username] = ws;
});

app.post('/messages_poll', (req, res) => {
    logged_users.add(req.body.username);
    let otherUsername = null;
    for (const item of logged_users) {
        if (item != req.body.username) {
            otherUsername = item;
            break;
        }
    }

    if (otherUsername == null || !(otherUsername in last_messages)) {
        res.send({});
    } else {
        res.send(last_messages[otherUsername]);
    }
})

app.post('/messages_long_poll', (req, res) => {
    logged_users.add(req.body.username);
    let otherUsername = null;
    for (const item of logged_users) {
        if (item != req.body.username) {
            otherUsername = item;
            break;
        }
    }

    eventEmitter.on(otherUsername, (username) => {
        res.end(JSON.stringify(last_messages[username]));
    });
});

app.post('/message', (req, res) => {
    last_messages[req.body.username] = req.body;
    eventEmitter.emit(req.body.username, req.body.username);

    let otherUsername = null;
    for (const item of logged_users) {
        if (item != req.body.username) {
            otherUsername = item;
            break;
        }
    }

    if (otherUsername in connections) {
        connections[otherUsername].send(JSON.stringify(req.body));
    }

    res.send({});
});