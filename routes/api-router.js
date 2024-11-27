const { getApi } = require("../controllers/app.controllers");
const articlesRouter = require("./api-routes/articles-router");
const commentsRouter = require("./api-routes/comments-router");

const topicsRouter = require("./api-routes/topics-router");
const usersRouter = require("./api-routes/users-router");
const apiRouter = require("express").Router();

apiRouter.use("/topics", topicsRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("/articles", articlesRouter);

apiRouter.use("/comments", commentsRouter);

apiRouter.get("/", getApi);

module.exports = apiRouter;
