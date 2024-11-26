const {
  getEndpointsFromFile,
  getTopicsFromDatabase,
  getArticlesFromDatabase,
  getArticlesIdFromDatabase,
  getCommentsFromDatabase,
  addCommentToDatabase,
  incrementArticleVotes,
  checkArticleExists,
  deleteCommentFromDatabase,
  checkCommentExists,
  getUsersFromDatabase,
  checkColumnNameExists,
  checkUserExists,
  checkValidQueries,
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
  const { query } = req;
  const validQueries = ["sort_by", "order"];
  const promises = [
    checkValidQueries(validQueries, query),
    checkColumnNameExists("articles", query.sort_by),
    getArticlesFromDatabase(query.sort_by, query.order),
  ];
  Promise.all(promises)
    .then(([_, __, articles]) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getCommentsByArticle = (req, res, next) => {
  const { params } = req;
  const promises = [
    checkArticleExists(params.article_id),
    getCommentsFromDatabase(params.article_id),
  ];
  Promise.all(promises)
    .then(([_, comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByArticle = (req, res, next) => {
  const { params, body } = req;
  const promises = [
    checkArticleExists(params.article_id),
    checkUserExists(body.username),
    addCommentToDatabase(params.article_id, body.username, body.body),
  ];
  Promise.all(promises)
    .then(([_, __, comment]) => {
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
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { params } = req;
  const promises = [
    checkCommentExists(params.comment_id),
    deleteCommentFromDatabase(params.comment_id),
  ];
  Promise.all(promises)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  getUsersFromDatabase()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};
