require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const Person = require('./models/person');

app.use(express.static('dist'));
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());

// let persons = [
//     {
//         id: "1",
//         name: "Arto Hellas",
//         number: "040-123456",
//     },
//     {
//         id: "2",
//         name: "Ada Lovelace",
//         number: "39-44-5323523",
//     },
//     {
//         id: "3",
//         name: "Dan Abramov",
//         number: "12-43-234345",
//     },
//     {
//         id: "4",
//         name: "Mary Poppendieck",
//         number: "39-23-6423122",
//     },
// ];

app.get('/', (req, res) => {
    res.send('<h1>Hello</h1>');
});

// get all the phonebook entries
app.get('/api/persons', (req, res) => {
    Person.find({}).then((people) => {
        res.json(people);
    });
});

app.get('/info', async (req, res) => {
    // display info on how many phone book entries there are
    const count = await Person.countDocuments({});

    const info = `<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`;

    res.send(info);
});

// fetch a single person
app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then((person) => {
        res.json(person);
    });
});

// delete a single person
app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(204).end();
        })
        .catch((err) => next(err));
});

// add a person
app.post('/api/persons', async (req, res, next) => {
    const body = req.body;
    const existingPerson = await Person.findOne({
        name: { $regex: new RegExp(body.name, 'i') },
    });

    if (!body.name) {
        return res.status(400).json({
            error: 'name missing',
        });
    } else if (!body.number) {
        return res.status(400).json({
            error: 'number missing',
        });
    }

    if (!existingPerson) {
        const person = new Person({
            name: body.name,
            number: body.number,
        });

        person
            .save()
            .then((savedPerson) => {
                res.json(savedPerson);
            })
            .catch((err) => next(err));
    } else {
        return res.status(400).json({
            error: 'name must be unique',
        });
    }
});

// update a person
app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body;

    Person.findByIdAndUpdate(
        req.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then((updatedPerson) => res.json(updatedPerson))
        .catch((err) => {
            next(err);
        });
});

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (err, req, res, next) => {
    console.error(err.message);

    if (err.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' });
    } else if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }

    next(err);
};

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
