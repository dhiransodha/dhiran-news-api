# Dhiran's News API

This project is an API for looking at news articles, and interacting with them. Comments can be posted on the articles, as long as they are associated with a user. Each article has a number of votes that can be incremeneted. The articles can also be sorted by any property. The details of each enpoint are outlined in the GET /api method, read from the endpoints.json file in the root

---

To run this project locally .env.development and .env.test files should be created in the root to link the code to the database: PGDATABASE=name_of_database.sql in the development file, and PGDATABASE=name_of_database_test in the test file

---

Relevant modules should be installed using the command `npm install`

---

Postgres should also be installed and running

---

The website is hosted here https://dhiran-news.onrender.com/api/

---

Minimum `Node.js` version `v22.7.0`
Minimum `PostgreSQL` version `17`
