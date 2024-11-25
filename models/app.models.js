const fs = require("fs/promises");
const db = require("../db/connection");

exports.getEndpointsFromFile = () => {
  return fs.readFile(`${__dirname}/../endpoints.json`).then((contents) => {
    return JSON.parse(contents);
  });
};

exports.getTopicsFromDatabase = () => {
  return db.query(`SELECT * FROM topics`).then(({ rows }) => rows);
};

exports.getArticlesFromDatabase = (article_id) => {
  const values = [];
  let query = `SELECT * FROM articles`;
  if (article_id) {
    query += ` WHERE article_id = $1`;
    values[0] = article_id;
  }
  return db.query(query, values).then(({ rows }) => rows);
};
