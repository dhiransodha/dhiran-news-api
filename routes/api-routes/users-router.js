const { getUsers, getUserByUsername } = require("../../controllers/app.controllers");

const usersRouter = require("express").Router();

usersRouter.get("/", getUsers);

usersRouter.get("/:username", getUserByUsername);

module.exports = usersRouter;
