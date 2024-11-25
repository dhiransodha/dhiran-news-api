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
  if (!/^\d+$/.test(article_id))
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
