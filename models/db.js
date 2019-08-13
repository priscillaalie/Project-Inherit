const mongoose =  require('mongoose');
/*
const MongoClient = require('mongodb').MongoClient;

const assert = require('assert');

// Connection URL
const url = 'mongodb+srv://priscilla:A9qiVFZSiqjFhfgm@cluster0-guonz.mongodb.net/test?retryWrites=true';

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    client.close();
});
*/



//copy from CONNECT (MongoDB Atlas)
const dbURI =
    "mongodb+srv://priscilla:A9qiVFZSiqjFhfgm@cluster0-guonz.mongodb.net/test?retryWrites=true";

const options = {
    useNewUrlParser: true,
    dbName: "ProjectInheritDB"
};

mongoose.connect(dbURI, options).then(
    () => {
        console.log("Database connection established!");
    },
    err => {
        console.log("Error connecting Database instance due to: ", err);
    }
);





/*
// Import the native MongoDB driver
const Mongo = require('mongodb')
// Import Winston for async logging
const Winston = require('winston')
// The MongoClient class provides an interface for connecting to a // MondoDB database
const MongoClient = Mongo.MongoClient
// Url of your MongoDB database. Substitute with your own
const dbURI = 'mongodb+srv://priscilla:A9qiVFZSiqjFhfgm@cluster0-guonz.mongodb.net/test?retryWrites=true&w=majority'
// Call the client comment method and provide a callback to report // connection results
MongoClient.connect(dbURI, (err, db) => {
    // If the connection failed, report the error and return
    if (err)
        return Winston.error(`Unable to connect to server: ${err}`)

    // The connection worked, let's log that too
    Winston.info(`Connected to MongoDB database at ${dbURI}`)
    // This is where we'll do our work against the db
    // When we're done, make sure to close the connection
    db.close()
});





const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://priscilla:A9qiVFZSiqjFhfgm@cluster0-guonz.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
});

*/

require('./user.js');
