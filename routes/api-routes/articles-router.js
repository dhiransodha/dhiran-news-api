const {
  getArticles,
  getArticleFromId,
  getCommentsByArticle,
  postCommentByArticle,
  patchVotesByArticle,
  postArticle,
  deleteArticleById,
} = require("../../controllers/app.controllers");

const articlesRouter = require("express").Router();

articlesRouter
  .route("/:article_id")
  .get(getArticleFromId)
  .patch(patchVotesByArticle)
  .delete(deleteArticleById);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticle)
  .post(postCommentByArticle);

articlesRouter.route("/").get(getArticles).post(postArticle);

module.exports = articlesRouter;
