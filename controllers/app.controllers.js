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
    if (article.length === 0)
      return Promise.reject({ msg: "bad request", status: 400 });
    res.status(200).send({ article: article[0] });
  }).catch(next);
};
