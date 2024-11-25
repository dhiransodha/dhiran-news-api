const {
  getEndpointsFromFile,
  getTopicsFromDatabase,
  getArticlesFromDatabase,
} = require("../models/app.models");

exports.getApi = (req, res, next) => {
  getEndpointsFromFile().then((endpoints) => {
    res.status(200).send({ endpoints });
  });
};

exports.getTopics = (req, res, next) => {
  getTopicsFromDatabase().then((topics) => {
    res.status(200).send({ topics });
  }).catch(next);
};

exports.getArticleFromId = (req, res, next) => {
  const { params } = req;
  getArticlesFromDatabase(params.article_id).then((article) => {
    res.status(200).send({ article: article[0] });
  }).catch(next);
};
