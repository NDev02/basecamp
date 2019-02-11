let apiKey;
let tbaKey = 'l546X6HHpPOiuPH0ZtO4rMgY1FvUWYIb9ruZRSdBcMlOsKBlMuyPzplegeFF7Oue';
let tbaRoot = 'https://www.thebluealliance.com/api/v3';
let root = location.origin;
let hideEventsList = true;
let selectedCode = "";

window.addEventListener('load', function () {

    apiKey = this.localStorage.getItem('key');
    if (apiKey == undefined) {
        alert('You must login first');
        this.location.assign('./index.html');
    }
    this.document.querySelector('#tba-key').innerHTML = tbaKey;
    this.document.querySelector('#admin-key').innerHTML = apiKey;
    apiRequest('', false, function (res) {
        document.querySelector('#connection-status').innerHTML = `Connected to Basecamp: ${res.online || false}`;
    });
    apiRequest('events', false, populateEventsList);

});

function populateEventsList(events) {
    let ul = document.querySelector('#events-list');
    ul.innerHTML = "";
    events = events.sort();
    for (let event of events) {
        ul.innerHTML += `<li><a href="javascript:setEvent('${event}')">${event}</a></li>`;
    }
    ul.hidden = true;
}

function blueRequest(dir, callback) {
    fetch(`${tbaRoot}/${dir}?X-TBA-Auth-Key=${tbaKey}`).then(res => res.json()).then(callback);
}

function apiRequest(subdir, isRoot, callback) {
    if (!isRoot)
        fetch(`${root}/${subdir}?key=${apiKey}`).then(res => res.json()).then(callback);
    else
        fetch(`${root}/admin/${subdir}?key=${apiKey}`).then(res => res.json()).then(callback);
}

function apiSend(subdir, isRoot, data, callback) {
    if (!isRoot)
        postData(`${root}/${subdir}?key=${apiKey}`, data).then(res => res.json()).then(callback);
    else
        postData(`${root}/admin/${subdir}?key=${apiKey}`, data).then(res => res.json()).then(callback);
}

function postData(url, data) {
    return fetch(url, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: "follow",
        referrer: "no-referrer",
        body: JSON.stringify(data)
    });
}

function eventsListToggle() {
    hideEventsList = !hideEventsList;
    let ul = document.querySelector('#events-list').hidden = hideEventsList;
}

function addEvent() {
    let eventInput = document.querySelector('#event-code').value;
    apiSend('events', true, eventInput.split(','), function (res) {
        if (res.msg == 'added events') {
            alert('Added events');
            document.querySelector('#event-code').value = "";
            apiRequest('events', false, populateEventsList);
        }
    });
}

function removeEvent() {
    let eventInput = document.querySelector('#event-code-remove').value;
    apiSend('events/delete', true, eventInput.split(','), function (res) {
        if (res.msg == 'deleted events') {
            alert('Deleted events');
            document.querySelector('#event-code-remove').value = "";
            apiRequest('events', false, populateEventsList);
        }
    });
}

function getBlueAllianceEvents() {
    let year = document.querySelector('#event-code-year').value;
    blueRequest(`events/${year}/keys`, function (eventCodes) {
        document.querySelector('#event-code-year').value = "";
        apiSend('events', true, eventCodes, function (res) {
            if (res.msg == 'added events') {
                alert('Added events');
                document.querySelector('#event-code').value = "";
                apiRequest('events', false, populateEventsList);
            }
        });
    });
}

function setEvent(evt) {
    selectedCode = evt;
    document.querySelector('#select-hint').innerHTML = selectedCode + `<br><br>Fill in the inputs to populate the database with matches`;
    populateMatches();
}