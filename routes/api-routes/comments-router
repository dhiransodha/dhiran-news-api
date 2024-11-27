const {
  deleteComment,
  patchCommentById,
} = require("../../controllers/app.controllers");

const commentsRouter = require("express").Router();

commentsRouter
  .route("/:comment_id")
  .patch(patchCommentById)
  .delete(deleteComment);

module.exports = commentsRouter;
