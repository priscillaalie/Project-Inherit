/*
db.js is connecting to the MongoDB Atlas which is where the data is stored
it is connecting using a driver
 */

const mongoose =  require('mongoose');

//copy from CONNECT (MongoDB Atlas)
const dbURI =
    "mongodb+srv://priscilla:GAinKjsdGiKoS3rW@cluster0-guonz.mongodb.net/test?retryWrites=true&w=majority";

const options = {
    useNewUrlParser: true,
    dbName: "ProjectInheritDB"
};

mongoose.connect(dbURI, options).then(
    () => {
        console.log("Database Connection Established!");
    },
    err => {
        console.log("Error connecting Database instance due to: ", err);
    }
);

require('./user.js');
require('./family');
