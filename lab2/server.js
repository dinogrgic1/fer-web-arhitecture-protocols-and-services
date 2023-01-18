const bodyParser = require("body-parser");
const express = require('express');
const cors = require('cors');
const EventEmitter = require('events');

AUTO_DISCONNECT_TICKS = 50;

const port = 5000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

let last_messages = {};
let logged_users = new Set();

const eventEmitter = new EventEmitter();

app.listen(port, () => {
    console.log(`Chat listening on port ${port}`)
})

app.post('/messages_poll', (req, res) => {
    logged_users.add(req.body.username);
    otherUsername = null;
    for (const item of logged_users) {
        if (item != req.body.username) {
            otherUsername = item;
            break;
        }
    }

    if (otherUsername == null || !(otherUsername in last_messages)) {
        res.send({});
        return;
    } else {
        res.send(last_messages[otherUsername]);
    }
})

app.post('/messages_long_poll', (req, res) => {
    logged_users.add(req.body.username);

    otherUsername = null;
    for (const item of logged_users) {
        if (item != req.body.username) {
            otherUsername = item;
            break;
        }
    }
    eventEmitter.on(otherUsername, () => {
        res.send(last_messages[otherUsername]);
    }); 

})

app.post('/message', (req, res) => {
    last_messages[req.body.username] = req.body;
    eventEmitter.emit(req.body.username);
    res.send({});
});