const express = require("express");
const { getApi, getTopics } = require("./controllers/app.controllers");
const app = express();

app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "page not found" });
});

module.exports = { app };
