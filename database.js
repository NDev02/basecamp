let Mongoose = require('mongoose');

class Scoutbase {

    constructor() {
        this.url = 'mongodb://localhost/Scoutbase';
        this.connection;
    }

    connect(onConnect) {
        Mongoose.connect('mongodb://localhost/Scoutbase', { useNewUrlParser: true }).then(e => {
            this.connection = Mongoose.connection;
            onConnect();
        });
    }

    createEvent(eventName) {
        this.connection.createCollection(eventName);
    }

    deleteEvent(eventName) {
        if (eventName == 'BURN_EVERYTHING') {
            console.log("This WILL break the server.");
            this.connection.db.collections().then(collections => {
                for (let collection of collections)
                    this.connection.dropCollection(collection.s.name);
            });
        }
        else
            this.connection.dropCollection(eventName);
    }

    writeToEvent(eventName, data) {
        data['type'] = 'config';
        this.connection.collection(eventName).insertOne(data);
    }

    getEvents() {
        return this.connection.db.collections();
    }

    getMatches(eventName) {
        return this.connection.db.collection(eventName).find().toArray();
    }

    getMatchesForTeam(eventName, team) {
        return this.connection.db.collection(eventName).find({ 'team': team }).toArray();
    }

    getMatchesForClimb(eventName, climb) {
        return this.connection.db.collection(eventName).find({ 'level': climb }).toArray();
    }

    postMatchData(eventName, data) {
        data['type'] = 'match';
        return this.connection.db.collection(eventName).insertOne(data);
    }

}

module.exports = Scoutbase;