const {
  getUsers,
  getUserByUsername,
  postUser,
} = require("../../controllers/app.controllers");

const usersRouter = require("express").Router();

usersRouter.route("/").get(getUsers).post(postUser);

usersRouter.get("/:username", getUserByUsername);

module.exports = usersRouter;
