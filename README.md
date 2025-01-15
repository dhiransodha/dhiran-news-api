# Dhiran's News API

**LINK TO DEPLOYED VERSION**
Current working version [here](https://dhiran-news-app.netlify.app/articles).
When first using the app and loading content you need to wait around 20s and refresh the page a few times, since the free backend hosting site used spins down when left not in use.

**WHAT EVEN IS THIS APP?**
This app is my first project, built in two weeks with the goal of learning how to use the core functionalities of expressJS (backend) and reactJS (frontend). It was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/).

The app lets anyone browse articles posted by the userbase. Users can sort through articles by title, filter by different categories or sort by popularity. If the user has an account (which can be made by registering - for free!) then they can post their own articles, delete their articles, post comments on articles, delete their comments and finally downvote or upvote articles.

Enjoy! Post an article if you so dare!

---

The details of each endpoint are outlined in the GET /api method, which can be read from the endpoints.json file located in the root directory.

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
