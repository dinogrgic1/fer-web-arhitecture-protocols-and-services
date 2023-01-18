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
                addMessageToPage(data.message, data.username, data.timestamp);
                last_message = data;
                localStorage.setItem('lastMessage', data);
            }
        }
    }
};

window.addEventListener('load', () => {
    eventListenerSetup();
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });

    if (localStorage.getItem("username") === null || localStorage.getItem("username") === undefined) {
        let username = prompt("Insert your username", "");
        localStorage.setItem("username", username);
    }

    switch(document.getElementById("pingMode").value) {
        case POLLING:
            var interval = setInterval(pollMessages, 1000);
            break;
        case LONG_POLLING:
            longPollMessages();
            break;
        case SOCKET:
            break;
        default:
            console.log('errror choice');
            break;
    }
});

function formatted_date(date) {
    var result = "";
    result += date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() +
        " " + date.getHours() + ":" + date.getMinutes() + ":" +
        date.getSeconds();
    return result;
}

function addMessageToPage(msgStr, username, timeStr) {
    const myUsername = localStorage.getItem("username");
    const messagesContext = document.getElementById("messages");

    const container = document.createElement("div");
    container.className = myUsername == username ? "container" : "container darker"

    const user = document.createElement("p")
    user.innerHTML = `<u>${username}</u>`
    const message = document.createElement("p");
    message.innerHTML = msgStr;
    const time = document.createElement("span")
    time.className = myUsername == username ? "time-right" : "time-left";
    time.innerText = formatted_date(new Date(timeStr));
    container.appendChild(user);
    container.appendChild(message);
    container.appendChild(time);

    messagesContext.appendChild(container);
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
}

function sendMessage(input, event) {
    event.preventDefault();

    let data = { "username": localStorage.getItem("username"), "message": input.value, "timestamp": Date.now() };
    xhttp.open("POST", `${BASE_URL}/message`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));

    addMessageToPage(data.message, data.username, data.timestamp);
    input.value = "";
}

async function pollMessages() {
    const data = {"username" : localStorage.getItem("username"), "last_message" : last_message.timestamp }
    xhttp.open("POST", `${BASE_URL}/messages_poll`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
}

async function longPollMessages() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = async function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(xhttp.responseText);
            let data = JSON.parse(xhttp.responseText);
            if (xhttp.responseText != "{}") {
                if (last_message.timestamp != data.timestamp) {
                    addMessageToPage(data.message, data.username, data.timestamp);
                    last_message = data;
                    localStorage.setItem('lastMessage', data);
                }
            }
            await longPollMessages();
        }

        else if (this.status == 502) {
            await longPollMessages();
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };

    long_poll_running = true;
    const data = {"username" : localStorage.getItem("username"), "last_message" : last_message.timestamp }
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

setInterval(pollMessages, 1000);
