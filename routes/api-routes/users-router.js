const { getUsers } = require("../../controllers/app.controllers");

const usersRouter = require("express").Router();

usersRouter.get("/", getUsers);

module.exports = usersRouter;
