const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(express.json());
app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :body"
    )
);
// custom morgan config used above to return body object
morgan.token("body", function (req, res) {
    return JSON.stringify(req.body);
});

let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323523",
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345",
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-23-6423122",
    },
];

app.get("/", (req, res) => {
    res.send("<h1>Hello</h1>");
});

// get all the phonebook entries
app.get("/api/persons", (req, res) => {
    res.json(persons);
});

// display info on how many phone book entries there are
const info = `<p>Phonebook has info for ${
    persons.length
} people</p><p>${new Date()}</p>`;

app.get("/info", (req, res) => {
    res.send(info);
});

// fetch a single person
app.get("/api/persons/:id", (req, res) => {
    const id = req.params.id;
    const person = persons.find((p) => p.id === id);

    if (person) {
        res.json(person);
    } else {
        res.status(404).send("That entry does not exist");
    }
});

// delete a single person
app.delete("/api/persons/:id", (req, res) => {
    const id = req.params.id;
    persons = persons.filter((p) => p.id != id);

    res.send(204).end();
});

// add a person
app.post("/api/persons", (req, res) => {
    const body = req.body;
    const existingPerson = persons.find(
        (p) => p.name.toLowerCase() === body.name.toLowerCase()
    );

    if (!body.name) {
        return res.status(400).json({
            error: "name missing",
        });
    } else if (!body.number) {
        return res.status(400).json({
            error: "number missing",
        });
    }

    if (existingPerson) {
        return res.status(400).json({
            error: "name must be unique",
        });
    } else {
        const person = {
            name: body.name,
            number: body.number,
            id: String(Math.floor(Math.random() * 999999) + 1),
        };

        persons = [...persons, person];

        res.json(person);
    }
});

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
