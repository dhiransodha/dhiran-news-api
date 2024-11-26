const express = require("express");
const {
  getApi,
  getTopics,
  getArticleFromId,
  getArticles,
  getCommentsByArticle,
  postCommentByArticle,
} = require("./controllers/app.controllers");
const app = express();

app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleFromId);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticle);

app.post("/api/articles/:article_id/comments", postCommentByArticle);

app.all("*", (req, res) => {
  res.status(404).send({ status: 404, msg: "page not found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502" || err.code === "23503") {
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
