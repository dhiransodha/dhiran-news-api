const { app } = require("../app");
const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const testData = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topic objects each with a slug and description property", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an article object corresponding to the id in the endpoint", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 3,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("400: Responds with a bad request status when given an invalid id", () => {
    return request(app)
      .get("/api/articles/lkjfsd")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid id");
      });
  });

  test("404: Responds with a not found status when given a valid id that doesn't exist in the database", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("id not found");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with an array of all the articles as objects in the correct format", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("200: The articles objects should not have a body property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        articles.forEach((article) => {
          expect(article).not.toMatchObject({
            body: expect.anything(),
          });
        });
      });
  });
  test("200: The articles should be sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        const datedArticles = articles.map((article) => {
          article.created_at = Date(article.created_at);
          return article;
        });
        expect(datedArticles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with an array of all the articles as objects in the correct format", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(11);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
      });
  });
  test("200: Comments should be served with most recent comment first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        const datedComments = comments.map((comment) => {
          comment.created_at = Date(comment.created_at);
          return comment;
        });
        expect(datedComments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("400: Responds with a bad request status when given an invalid article id", () => {
    return request(app)
      .get("/api/articles/lkjfsd/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  test("404: Responds with a not found status when given a valid article id that doesn't have any comments", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article not found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("200: Serves the comment when given a valid body", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "icellusedkars",
        body: "cool article",
      })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          author: "icellusedkars",
          article_id: 1,
          created_at: expect.any(String),
          votes: 0,
          body: "cool article",
        });
      });
  });
  test("200: Adds the comment to the database when given a valid body", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "icellusedkars",
        body: "cool article",
      })
      .expect(200)
      .then(({ body: { comment } }) => {
        return db
          .query(`SELECT * FROM comments ORDER BY created_at DESC`)
          .then(({ rows }) => {
            rows[0].created_at = `${rows[0].created_at}`;
            expect(rows[0]).toMatchObject(comment);
          });
      });
  });
  test("400: Gives a bad request status when not given enough information", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "icellusedkars",
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: Gives a bad request status when given invalid information", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        body: "cool article",
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("404: Gives an article not found message when the article id is valid but the article does not exist", () => {
    return request(app)
      .post("/api/articles/999/comments")
      .send({
        username: "icellusedkars",
        body: "cool article",
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article not found");
      });
  });
  test("400: Gives a bad request status when the username does not exist", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "hi",
        body: "cool article",
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: Serves the article with the incremented votes", () => {
    return db
      .query(`SELECT votes FROM articles WHERE article_id = 1`)
      .then(({ rows }) => {
        return request(app)
          .patch("/api/articles/1")
          .send({
            inc_votes: 27,
          })
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article).toMatchObject({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(String),
              votes: rows[0].votes + 27,
              article_img_url: expect.any(String),
            });
          });
      });
  });
  test("200: Appends the new vote count to the database", () => {
    return db
      .query(`SELECT votes FROM articles WHERE article_id = 3`)
      .then(({ rows }) => {
        return request(app)
          .patch("/api/articles/3")
          .send({
            inc_votes: 48,
          })
          .expect(200)
          .then(() => {
            return db
              .query(`SELECT * FROM articles WHERE article_id = 3`)
              .then(({ rows: [article] }) => {
                expect(article).toMatchObject({
                  article_id: expect.any(Number),
                  title: expect.any(String),
                  topic: expect.any(String),
                  author: expect.any(String),
                  body: expect.any(String),
                  created_at: expect.any(Date),
                  votes: rows[0].votes + 48,
                  article_img_url: expect.any(String),
                });
              });
          });
      });
  });
  test("404: Gives a relevant message when article id is valid but doesn't exist", () => {
    return request(app)
      .patch("/api/articles/999")
      .send({
        inc_votes: 48,
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article not found");
      });
  });
  test("400: Gives a bad request when not enough information is valid", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({})
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: Gives a bad request when the inc_votes type is incorrect", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({
        inc_votes: 56.3,
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("DELETE /api/comments/comment_id:", () => {
  test("204: Deletes the comment from the database", () => {
    return request(app)
      .delete("/api/comments/3")
      .expect(204)
      .then(() => {
        return db
          .query(`SELECT * FROM comments WHERE comment_id = 3`)
          .then(({ rows }) => {
            expect(rows.length).toBe(0);
          });
      });
  });
  test("404: gives a 404 status when the comment id is valid but cannot be found", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("comment not found");
      });
  });
  test("400: gives a bad request when the comment id is invalid", () => {
    return request(app)
      .delete("/api/comments/fghj")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});
describe("GET /api/users", () => {
  test("200: serves all the users from the database", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users.length).toBe(4);
        users.forEach(user => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String)
          })
        })
      });
  });
});
