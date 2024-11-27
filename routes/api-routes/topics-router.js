const { getTopics } = require("../../controllers/app.controllers");

const topicsRouter = require("express").Router();

topicsRouter.get("/", getTopics);

module.exports = topicsRouter;
