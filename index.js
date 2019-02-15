let Database = require('./database');
let database = new Database();

let Express = require('express');
let api = Express();

let portalLogin = {
    "username": "ngordon",
    "password": "1559Scouter!"
}

// Breakdown model: {'auto': {}, 'tele': {}, 'end':{}}
/* Query all matches that include 1559, on red or blue */
/* {$or:[{'red.team': '1559'},{'blue.team': '1559'}]} */

let keys = [
    '2596ccc0-09d5-4b73-bebc-4107ee0c8f6e',
    '08ef2080-fea3-4251-9e1e-6ed9d96d6f80',
    'b441e20a-a805-41b4-abec-99ca1fb528fa',
    'c5d2be3f-213d-4f80-9880-c9e6adf7288d',
    '109c9f69-fce0-41e9-b88e-d60ee7677cb8'
];

let adminKeys = [
    '109c9f69-fce0-41e9-b88e-d60ee7677cb8'
];

const INVALID_ENDPOINT = { 'msg': 'Invalid endpoint, nothing here' };

api.use(Express.json());
api.use('/portal', Express.static('public'))
api.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
database.connect(connected);

function connected() {
    console.log('Connected to MongoDB');
}

api.all('*', function (req, res, next) {
    if (database.connection == undefined) {
        res.send({ 'msg': 'Database not connected, try again later' });
    }
    else if (!keys.includes(req.query.key)) {
        res.send({ 'msg': 'Unauthorized api request, add ?key=<valid key> to your request' });
    }
    else {
        next();
    }
});

api.all('/admin', function (req, res, next) {
    if (!adminKeys.includes(req.query.key)) {
        res.send({ 'msg': 'Unauthorized api request, add ?key=<valid admin key> to your request' });
    }
    else {
        next();
    }
});

api.get('/portal/login', function (req, res) {
    if (req.query.username == portalLogin.username && req.query.password == portalLogin.password)
        res.send({ 'msg': 'login-in', 'adminAuth': adminKeys[0] });
    else
        res.send({ 'msg': 'login-err' });
});

api.get('/', function (req, res) {
    res.send({ 'msg': 'Welcome to the scoutbase API', 'online': (database.connection != undefined), 'authorized': 'true', 'auth-key': req.query.key });
});

api.get('/events', function (req, res) {
    database.getEvents().then(collections => {
        let events = [];
        for (let collection of collections)
            events.push(collection.s.name);
        res.send(events);
    });
});

api.get('/:eventCode/matches', function (req, res) {
    database.getMatches(req.params.eventCode).then(matches => {
        res.send(matches);
    });
});

api.get('/:eventCode/matches/:team', function (req, res) {
    database.getMatchesForTeam(req.params.eventCode, req.params.team).then(matches => {
        res.send(matches);
    });
});

api.get('/:eventCode/scout', function (req, res) {
    let data = req.query;
    delete data.key;
    database.postMatchData(req.params.eventCode, data).then(r => {
        res.send(r);
    });
});

api.post('/admin/events/', function (req, res) {
    for (let event of req.body) {
        database.createEvent(event);
    }
    res.send({ 'msg': 'added events' });
});

api.post('/admin/events/delete', function (req, res) {
    for (let event of req.body) {
        database.deleteEvent(event);
    }
    res.send({ 'msg': 'deleted events' });
});

api.post('/admin/:eventCode/matches', function (req, res) {
    let eventCode = req.params.eventCode;
    for (let match of req.body) {
        database.writeToEvent(eventCode, match);
    }
    res.send({ 'msg': 'added matches' });
});

api.get('*', function (req, res) {
    res.send(INVALID_ENDPOINT);
});


api.listen(8080);