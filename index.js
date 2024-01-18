const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
require('dotenv').config();

const PORT = process.env.PORT || 3001;
morgan.token("header", function (req, res) {
  return Object.keys(req.body).length === 0 ?"-":JSON.stringify(req.body);
});

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :header "
  )
);

app.use(express.json());
app.use(cors());

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (req, res) => {
  const len = persons.length;
  const currentDate = new Date();
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  };
  const ISTDate = currentDate.toLocaleString("en-US", options);

  res.send(`<p> Phonebook has info for ${len} people <br/>${ISTDate} </p>`);
});

app.get("/api/persons", (req, res) => {
  res.status(200).json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const data = persons.find((person) => person.id === id);
  if (data === undefined){ 
    return res.status(404).send({error:"The person do not exist"});
  }
  res.json(data).send();
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (person === undefined){ 
   return res.status(404).json({"error":"The person is already deleted"});
  }
  persons = persons.filter((person) => person.id !== id);
  res.status(204).send();
});

app.post("/api/persons", (req, res) => {
  const data = req.body;

  if (data.number.trim() === "" || data.number === undefined)
    return res.status(400).json({ error: "Number is missing" });

  const Exist = persons.some((person) => person.name === data.name);
  if (Exist) return res.status(400).json({ error: "Name must be unique" });

  data.id = Math.round(Math.random() * 1000000000);
  persons.push(data);
  res.status(200).json(data);
});

app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});
