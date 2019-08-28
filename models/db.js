const mongoose =  require('mongoose');

//copy from CONNECT (MongoDB Atlas)
const dbURI =
    "mongodb+srv://priscilla:A9qiVFZSiqjFhfgm@cluster0-guonz.mongodb.net/test?retryWrites=true";

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
