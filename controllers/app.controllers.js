const {
  getEndpointsFromFile,
  getTopicsFromDatabase,
  getArticlesFromDatabase,
  getCommentsFromDatabase,
  addCommentToDatabase,
  incrementArticleVotes,
  checkArticleExists,
  deleteCommentFromDatabase,
  checkCommentExists,
  getUsersFromDatabase,
  checkColumnNameExists,
  checkUserExists,
  checkValidQueries,
  incrementCommentVotes,
  postArticleToDatabase,
  checkValidPage,
  checkValidLimit,
  postTopicToDatabase,
  deleteArticleByIdFromDatabase,
  postUserToDatabase,
  checkValidUser,
} = require("../models/app.models");

exports.getApi = (req, res, next) => {
  getEndpointsFromFile().then((endpoints) => {
    res.status(200).send({ endpoints });
  });
};

exports.getTopics = (req, res, next) => {
  getTopicsFromDatabase()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getArticleFromId = (req, res, next) => {
  const { params } = req;
  getArticlesFromDatabase(undefined, undefined, undefined, params.article_id)
    .then(([_, article]) => {
      res.status(200).send({ article: article[0] });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { query } = req;
  const validQueries = ["sort_by", "order", "topic", "limit", "p"];
  const promises = [
    // checkValidQueries(validQueries, query),
    Promise.resolve(),
    checkValidLimit(query.limit),
    checkValidPage(query.p),
  ];
  if (query.sort_by !== "comment_count")
    promises[0] = checkColumnNameExists("articles", query.sort_by);
  Promise.all(promises)
    .then(() => {
      return getArticlesFromDatabase(
        query.sort_by,
        query.order,
        query.topic,
        undefined,
        query.limit,
        query.p
      ).then(([total_count, articles]) => {
        res.status(200).send({ total_count, articles });
      });
    })
    .catch(next);
};

exports.getCommentsByArticle = (req, res, next) => {
  const { params, query } = req;
  const promises = [
    checkArticleExists(params.article_id),
    checkValidLimit(query.limit),
    checkValidPage(query.p),
  ];
  Promise.all(promises)
    .then(() => {
      return getCommentsFromDatabase(
        params.article_id,
        query.limit,
        query.p
      ).then((comments) => {
        res.status(200).send({ comments });
      });
    })
    .catch(next);
};

exports.postCommentByArticle = (req, res, next) => {
  const { params, body } = req;
  const promises = [
    checkArticleExists(params.article_id),
    checkUserExists(body.username),
    addCommentToDatabase(params.article_id, body.username, body.body),
  ];
  Promise.all(promises)
    .then(([_, __, comment]) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.patchVotesByArticle = (req, res, next) => {
  const { params, body } = req;
  const promises = [
    checkArticleExists(params.article_id),
    incrementArticleVotes(params.article_id, body.inc_votes),
  ];
  Promise.all(promises)
    .then(([_, article]) => {
      article.created_at = String(article.created_at);
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { params } = req;
  const promises = [
    checkCommentExists(params.comment_id),
    deleteCommentFromDatabase(params.comment_id),
  ];
  Promise.all(promises)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  getUsersFromDatabase()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const promises = [
    checkUserExists(req.params.username),
    getUsersFromDatabase(req.params.username),
  ];
  Promise.all(promises)
    .then(([_, [user]]) => {
      res.status(200).send({ user });
    })
    .catch(next);
};

exports.patchCommentById = (req, res, next) => {
  const promises = [
    checkCommentExists(req.params.comment_id),
    incrementCommentVotes(req.params.comment_id, req.body.inc_votes),
  ];
  Promise.all(promises)
    .then(([_, comment]) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  postArticleToDatabase(req.body)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.postTopic = (req, res, next) => {
  postTopicToDatabase(req.body)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};

exports.deleteArticleById = (req, res, next) => {
  checkArticleExists(req.params.article_id)
    .then(() => {
      return deleteArticleByIdFromDatabase(req.params.article_id).then(() => {
        res.status(204).send();
      });
    })
    .catch(next);
};

exports.postUser = (req, res, next) => {
  Promise.all([checkValidUser(req.body), postUserToDatabase(req.body)])
    .then(([_, user]) => {
      console.log(user);
      res.status(201).send({ user });
    })
    .catch((err) => {
      if (err.code === "23505")
        return next({ status: 400, msg: "username taken" });
      else return next(err);
    });
};
