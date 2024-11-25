const express = require("express");
const {
  getApi,
  getTopics,
  getArticleFromId,
  getArticles,
  getCommentsByArticle,
} = require("./controllers/app.controllers");
const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleFromId);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticle);

app.all("*", (req, res) => {
  res.status(404).send({ status: 404, msg: "page not found" });
});

app.use((err, req, res, next) => {
  if (err.msg && err.status) {
    res.status(err.status).send(err);
  } else next(err);
});

app.use((err, req, res, next) => {
  res.status(500).send({ status: 500, msg: "internal server error" });
});

module.exports = { app };
