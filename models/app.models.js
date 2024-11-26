const fs = require("fs/promises");
const db = require("../db/connection");
const format = require("pg-format");

exports.getEndpointsFromFile = () => {
  return fs.readFile(`${__dirname}/../endpoints.json`).then((contents) => {
    return JSON.parse(contents);
  });
};

exports.getTopicsFromDatabase = () => {
  return db.query(`SELECT * FROM topics`).then(({ rows }) => rows);
};

exports.getArticlesIdFromDatabase = (article_id) => {
  if (article_id && !/^\d+$/.test(article_id))
    return Promise.reject({ msg: "invalid id", status: 400 });
  const values = [];
  let query = `SELECT * FROM articles`;
  if (article_id) {
    query += ` WHERE article_id = $1`;
    values[0] = article_id;
  }
  return db.query(query, values).then(({ rows }) => {
    if (rows.length === 0)
      return Promise.reject({ msg: "id not found", status: 404 });
    else return rows;
  });
};

exports.getArticlesFromDatabase = () => {
  let query = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comments.comment_id) AS INT) AS comment_count
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC`;
  return db.query(query).then(({ rows }) => {
    return rows.map((article) => {
      article.created_at = String(article.created_at);
      return article;
    });
  });
};

exports.getCommentsFromDatabase = (article_id) => {
  const values = [];
  let query = `SELECT * FROM comments`;
  if (article_id) {
    query += ` WHERE article_id = $1`;
    values[0] = article_id;
  }
  query += ` ORDER BY created_at DESC`;
  return db.query(query, values).then(({ rows }) => {
    return rows.map((comment) => {
      comment.created_at = String(comment.created_at);
      return comment;
    });
  });
};

exports.addCommentToDatabase = (article_id, username, body) => {
  const array = [[article_id, username, body]];
  const query = `INSERT INTO comments(article_id, author, body) 
  VALUES %L
  RETURNING *`;
  const formattedQuery = format(query, array);
  return db.query(formattedQuery).then(({ rows }) => {
    rows[0].created_at = String(rows[0].created_at);
    return rows[0];
  });
};

exports.incrementArticleVotes = (article_id, inc_votes) => {
  const values = [article_id, inc_votes];
  return db
    .query(
      `UPDATE articles SET votes = votes + $2 WHERE article_id = $1 RETURNING *`,
      values
    )
    .then(({ rows: [article] }) => article);
};

exports.checkArticleExists = (article_id) => {
  const values = [article_id];
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, values)
    .then(({ rows }) => {
      if (!rows.length)
        return Promise.reject({ msg: "article not found", status: 404 });
    });
};

exports.deleteCommentFromDatabase = (comment_id) => {
  const values = [comment_id];
  return db.query(`DELETE FROM comments WHERE comment_id = $1`, values);
};

exports.checkCommentExists = (comment_id) => {
  const values = [comment_id];
  return db
    .query(`SELECT * FROM comments WHERE comment_id = $1`, values)
    .then(({ rows }) => {
      if (!rows.length)
        return Promise.reject({ msg: "comment not found", status: 404 });
    });
};

exports.getUsersFromDatabase = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => rows);
};
