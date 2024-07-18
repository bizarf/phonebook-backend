const mongoose = require("mongoose");

// command line app
if (process.argv.length < 3) {
    console.log("give password as argument");
    process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://tonyhoong40:${password}@cluster0.gee6fq8.mongodb.net/phoneApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model("Person", personSchema);

// if the command line contains extra commands after the password
if (process.argv.length > 3) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    });

    person.save().then((result) => {
        console.log(
            `added ${person.name} number ${person.number} to phonebook`
        );
        mongoose.connection.close();
    });
    // if the commands are only node mongo.js password, then return phonebook
} else if (process.argv.length === 3) {
    console.log("phonebook:");
    Person.find({}).then((result) => {
        result.forEach((note) => {
            console.log(`${note.name} ${note.number}`);
        });
        mongoose.connection.close();
    });
}
