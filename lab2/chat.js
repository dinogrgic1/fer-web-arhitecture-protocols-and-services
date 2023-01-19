let mode = POLLING;
let last_message_timestamp = 0;

function addUsername() {
    let username = prompt("Insert your username", "");
    localStorage.setItem("username", username);
}

window.addEventListener('load', () => {
    eventListenerSetup();
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });

    // Check if username is undefined and prompt user for it.
    if (localStorage.getItem("username") === null || localStorage.getItem("username") === undefined) {
        addUsername();
    }

    switch(document.getElementById("pingMode").value) {
        case POLLING:
            setInterval(pollMessages, 5000);
            break;
        case LONG_POLLING:
            longPollMessages();
            break;
        case SOCKET:
            socketMessages();
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

function addMessagesToPage(messages) {
    for (const idx in messages) {
        if (messages[idx] == null) {
            continue;
        }
        addMessageToPage(messages[idx].message, messages[idx].username, messages[idx].timestamp);
    }
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
    last_message_timestamp = myUsername == username ? last_message_timestamp : timeStr;
    container.appendChild(user);
    container.appendChild(message);
    container.appendChild(time);

    messagesContext.appendChild(container);
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
}

function sendMessage(input, event) {
    event.preventDefault();

    let data = { "username": localStorage.getItem("username"), "message": input.value, "timestamp": Date.now() };
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", `${BASE_URL}/message`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));

    addMessageToPage(data.message, data.username, data.timestamp);
    input.value = "";
}

async function pollMessages() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = async function () {
        if (this.readyState == 4 && this.status == 200) {
            let data = JSON.parse(xhttp.responseText);
            addMessagesToPage(data);
        }
    };
    const data = {"username" : localStorage.getItem("username"), "last_message" : last_message_timestamp }
    xhttp.open("POST", `${BASE_URL}/messages_poll`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
}

async function longPollMessages() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = async function () {
        if (this.readyState == 4 && this.status == 200) {
            let data = JSON.parse(xhttp.responseText);
            addMessagesToPage(data);
            await longPollMessages();
        }
        else if (this.status == 502) {
            await longPollMessages();
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };

    const data = {"username" : localStorage.getItem("username"), "last_message" : last_message_timestamp }
    xhttp.open("POST", `${BASE_URL}/messages_long_poll`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
}

async function socketMessages() {
    if (document.getElementById("pingMode").value != SOCKET) {
        return;
    }
    
    const username = localStorage.getItem("username");
    let socket = new WebSocket(`${SOCKET_URL}?username=${username}`);
    localStorage.setItem("socket", socket)

    socket.onmessage = function(event) {
        let data = JSON.parse(event.data);
        addMessagesToPage(data);
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
