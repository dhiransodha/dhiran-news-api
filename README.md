# Dhiran's News API

This project provides an API for accessing and interacting with news articles. Users can post comments on articles, and each article and comment has a count of votes that can be incremented. Additionally, articles can be sorted and are paginated. The details of each endpoint are outlined in the GET /api method, which can be read from the endpoints.json file located in the root directory.

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
