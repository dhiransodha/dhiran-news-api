const { getEndpointsFromFile, getTopicsFromDatabase } = require("../models/app.models");

exports.getApi = (req, res, next) => {
  getEndpointsFromFile().then((endpoints) => {
    res.status(200).send({ endpoints });
  });
};

exports.getTopics = (req, res, next) => {
  getTopicsFromDatabase().then(topics => {
    console.log(topics)
    res.status(200).send({topics})
  })
}