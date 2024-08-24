const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let users = [];
let exercises = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// POST to /api/users to create a new user
app.post("/api/users", (req, res) => {
  const username = req.body.username;
  const _id = Date.now().toString(36); // Simple unique ID generator
  const newUser = { username, _id };
  users.push(newUser);
  res.json(newUser);
});

// GET /api/users to get a list of all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// POST to /api/users/:_id/exercises to add exercises
app.post("/api/users/:_id/exercises", (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;
  const user = users.find((u) => u._id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const exerciseDate = date
    ? new Date(date).toDateString()
    : new Date().toDateString();
  const exercise = {
    _id: userId,
    description,
    duration: parseInt(duration),
    date: exerciseDate,
  };

  exercises.push(exercise);

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id,
  });
});

// GET /api/users/:_id/logs to get exercise log for a user
app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find((u) => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let userExercises = exercises.filter((ex) => ex._id === userId);

  // Apply date filter if 'from' and 'to' are provided
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter((ex) => new Date(ex.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter((ex) => new Date(ex.date) <= toDate);
  }

  // Apply limit if provided2
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map((ex) => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date,
    })),
  });
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
