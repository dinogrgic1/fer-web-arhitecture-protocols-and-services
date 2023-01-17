const bodyParser = require("body-parser");
const express = require('express');
const cors = require('cors');    

AUTO_DISCONNECT_TICKS = 50;

const port = 5000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

let last_messages = {};
let logged_users = new Set();

app.listen(port, () => {
  console.log(`Chat listening on port ${port}`)
})

app.get('/messages_poll/:id', (req, res) => {
    logged_users.add(req.params.id);

    otherUserId = null;
    for (const item of logged_users) {
        if (item != req.params.id) {
            otherUserId = item;
            break;
        }
    }

    if (otherUserId == null || !(otherUserId in last_messages)) {
        res.send({});
        return;
    } else {
        res.send(last_messages[otherUserId]);
    }
})

app.post('/messages_long_poll', (req, res) => {
    logged_users.add(req.body.id);

    otherUserId = null;
    for (const item of logged_users) {
        if (item != req.params.id) {
            otherUserId = item;
            break;
        }
    }

    last_timestamp = null;
    if (otherUserId in last_messages) {
        last_timestamp = last_messages[otherUserId].timestamp
    }

    while(last_timestamp == req.body.last_message) {
        if (otherUserId in last_messages) {
            last_timestamp = last_messages[otherUserId].timestamp
        }
    }

    if (otherUserId == null || !(otherUserId in last_messages)) {
        return;
    } else {
        res.send(last_messages[otherUserId]);
    }
})


app.post('/message', (req, res) => {
    last_messages[req.body.userId] = req.body;
    res.send({});
});