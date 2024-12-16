const express = require("express");
const cors = require("cors");
const {
  getCommentsByArticle,
  postCommentByArticle,
  patchVotesByArticle,
  deleteComment,
} = require("./controllers/app.controllers");
const app = express();
const apiRouter = require("./routes/api-router");

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

app.all("*", (req, res) => {
  res.status(404).send({ status: 404, msg: "page not found" });
});

app.use((err, req, res, next) => {
  const badRequestCodes = [
    "22P02",
    "23502",
    "23503",
    "42703",
    "42601",
    "2201W",
  ];
  if (badRequestCodes.includes(err.code)) {
    res.status(400).send({ msg: "bad request" });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.msg && err.status) {
    res.status(err.status).send(err);
  } else next(err);
});

app.use((err, req, res, next) => {
  console.log(err.code);
  res.status(500).send({ status: 500, msg: "internal server error" });
});

module.exports = { app };
