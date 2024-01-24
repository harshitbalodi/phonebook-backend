const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const {
  Person,
  SavePerson,
  DeletePerson,
  UpdatePerson,
  FindUsingId,
} = require("./models/person");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

const url = process.env.MONGO_URI;
mongoose.set("strictQuery", false);

mongoose
  .connect(url)
  .then((res) => {
    console.log("connection successful");
  })
  .catch((err) => {
    console.log("connection error", err.message);
  });

morgan.token("header", function (req, res) {
  return Object.keys(req.body).length === 0 ? "-" : JSON.stringify(req.body);
});

app.use(express.static("dist"));
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :header "
  )
);

app.use(express.json());
app.use(cors());

var persons = [];

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

app.get("/api/persons", async (req, res) => {
  persons = await Person.find({});
  res.status(200).json(persons);
});

app.get("/api/persons/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const Persondata = await FindUsingId(id);
    res.status(200).json(Persondata);
  } catch (err) {
    const error = new Error("not a valid URL");
    error.statusCode = 404;
    next(error);
  }
});

app.delete("/api/persons/:id", async (req, res, next) => {
  const id = req.params.id;
  console.log("at line number 73", id);
  try {
    await DeletePerson(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.post("/api/persons", async (req, res, next) => {
  const data = req.body;

  if (data.number.trim() === "" || data.number === undefined)
    return res.status(400).json({ error: "Number is missing" });
  try {
    const savedPersons = await SavePerson(data);
    console.log(savedPersons);
    savedPersons.id = savedPersons._id.toString();
    delete savedPersons._id;
    delete savedPersons.__v;

    res.status(201).json(savedPersons);
  } catch (error) {
    next(error);
  }
});

app.put("/api/persons/:id", async (req, res, next) => {
  const id = req.params.id;
  const newData = req.body;

  try {
    const updatedPerson = await UpdatePerson(id, newData);
    res.status(200).json(updatedPerson);
  } catch (err) {}
});

app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown Endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.stack);
  const statusCode = error.statusCode || 500;
  res
    .status(statusCode)
    .json({ error: { message: error.message || "Internal Server Error" } });
};

app.use(errorHandler);

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed due to app termination");
  });
});
