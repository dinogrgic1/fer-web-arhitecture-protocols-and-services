const xhttp = new XMLHttpRequest();

const POLLING = "1"
const LONG_POLLING = "2"
const SOCKET = "3"

let long_poll_running = false;

let mode = POLLING;
let last_message = localStorage.getItem('lastMessage') ?? {};

xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        if (xhttp.responseText != "{}") {
            let data = JSON.parse(xhttp.responseText);
            if (last_message.timestamp != data.timestamp) {
                addMessageToPage(data.message, data.userId, data.timestamp);
                last_message = data;
                localStorage.setItem('lastMessage', data);
            }
        }
    }
};

window.addEventListener('load', () => {
    eventListenerSetup();
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
});

function formatted_date(date) {
    var result = "";
    result += date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() +
        " " + date.getHours() + ":" + date.getMinutes() + ":" +
        date.getSeconds();
    return result;
}

function addMessageToPage(msgStr, userId, timeStr) {
    const myId = localStorage.getItem("id");
    const messagesContext = document.getElementById("messages");

    const container = document.createElement("div");
    container.className = myId == userId ? "container" : "container darker"

    const user = document.createElement("p")
    user.innerHTML = `<u>User #${userId}</u>`
    const message = document.createElement("p");
    message.innerHTML = msgStr;
    const time = document.createElement("span")
    time.className = myId == userId ? "time-right" : "time-left";
    time.innerText = formatted_date(new Date(timeStr));
    container.appendChild(user);
    container.appendChild(message);
    container.appendChild(time);

    messagesContext.appendChild(container);
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
}

function sendMessage(input, event) {
    event.preventDefault();

    let data = { "userId": localStorage.getItem("id"), "message": input.value, "timestamp": Date.now() };
    xhttp.open("POST", `${BASE_URL}/message`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));

    addMessageToPage(data.message, data.userId, data.timestamp);
    input.value = "";
}

function pollMessages() {
    if (document.getElementById("pingMode").value != POLLING) {
        return;
    }
    const userId = localStorage.getItem("id")
    xhttp.open("GET", `${BASE_URL}/messages_poll/${userId}`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

function longPollMessages() {
    if (document.getElementById("pingMode").value != LONG_POLLING || long_poll_running == true) {
        return;
    }
    long_poll_running = true;
    console.log(last_message.timestamp);
    const data = {"userId" : localStorage.getItem("id"), "last_message" : last_message.timestamp }
    xhttp.open("POST", `${BASE_URL}/messages_long_poll`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
}

function socketMessages() {
    if (document.getElementById("pingMode").value != SOCKET) {
        return;
    }
}

function eventListenerSetup() {
    var input = document.getElementById("messageBox");
    input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            if (input.value != "") {
                sendMessage(input, event);
            }
        }
    });
}

var interval = setInterval(pollMessages, 1000);
var long_interval = setInterval(longPollMessages, 1000);