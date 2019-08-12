const mongoose =  require('mongoose');




//copy from CONNECT (MongoDB Atlas)
const dbURI =
    "mongodb+srv://priscilla:A9qiVFZSiqjFhfgm@cluster0-guonz.mongodb.net/test?retryWrites=true&w=majority";

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

// require('./users.js');
