const {
  getEndpointsFromFile,
  getTopicsFromDatabase,
  getArticlesFromDatabase,
  getArticlesIdFromDatabase,
  getCommentsFromDatabase,
  addCommentToDatabase,
  incrementArticleVotes,
  checkArticleExists,
} = require("../models/app.models");

exports.getApi = (req, res, next) => {
  getEndpointsFromFile().then((endpoints) => {
    res.status(200).send({ endpoints });
  });
};

exports.getTopics = (req, res, next) => {
  getTopicsFromDatabase()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getArticleFromId = (req, res, next) => {
  const { params } = req;
  getArticlesIdFromDatabase(params.article_id)
    .then((article) => {
      res.status(200).send({ article: article[0] });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  getArticlesFromDatabase()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getCommentsByArticle = (req, res, next) => {
  const { params } = req;
  getCommentsFromDatabase(params.article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByArticle = (req, res, next) => {
  const { params, body } = req;
  const promises = [
    checkArticleExists(params.article_id),
    addCommentToDatabase(params.article_id, body.username, body.body),
  ];
  Promise.all(promises)
    .then(([_, comment]) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

exports.patchVotesByArticle = (req, res, next) => {
  const { params, body } = req;
  const promises = [
    checkArticleExists(params.article_id),
    incrementArticleVotes(params.article_id, body.inc_votes),
  ];
  Promise.all(promises)
    .then(([_, article]) => {
      article.created_at = String(article.created_at);
      console.log(article)
      res.status(200).send({ article });
    })
    .catch(next);
};
