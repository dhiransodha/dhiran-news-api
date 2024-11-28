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
          comment_count: expect.any(Number),
        });
      });
  });
  test("400: Responds with a bad request status when given an invalid id", () => {
    return request(app)
      .get("/api/articles/lkjfsd")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  test("404: Responds with a not found status when given a valid id that doesn't exist in the database", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
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
  test("200: The articles can be queried to be sorted by any valid column, default created_at and order descending", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("article_id", { descending: true });
      })
      .then(() => {
        return request(app)
          .get("/api/articles?sort_by=comment_count")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("comment_count", {
              descending: true,
            });
          });
      })
      .then(() => {
        return request(app)
          .get("/api/articles?sort_by=author")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("author", { descending: true });
          });
      });
  });
  test("200: The articles can be queried to order by ascending or descending", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        const datedArticles = articles.map((article) => {
          article.created_at = Date(article.created_at);
          return article;
        });
        expect(datedArticles).toBeSortedBy("created_at");
      })
      .then(() => {
        return request(app)
          .get("/api/articles?order")
          .expect(200)
          .then(({ body: { articles } }) => {
            const datedArticles = articles.map((article) => {
              article.created_at = Date(article.created_at);
              return article;
            });
            expect(datedArticles).toBeSortedBy("created_at", {
              descending: true,
            });
          });
      })
      .then(() => {
        return request(app)
          .get("/api/articles?order=asc&&sort_by=votes")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("votes");
          });
      });
  });
  test("400: Gives bad request when trying to sort by an invalid column", () => {
    return request(app)
      .get("/api/articles?sort_by=name")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: Gives bad request when trying to order by an invalid parameter", () => {
    return request(app)
      .get("/api/articles?order=bob")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("200: The articles can be queried to filter by topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(12);
        articles.forEach((article) => {
          expect(article).toMatchObject({ topic: "mitch" });
        });
      })
      .then(() => {
        return request(app)
          .get("/api/articles?topic=cats")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(1);
            articles.forEach((article) => {
              expect(article).toMatchObject({ topic: "cats" });
            });
          });
      });
  });
  test("200: Should return nothing if the topic exists but no articles with that topic", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("no articles found with topic 'paper'");
      });
  });
  test("404: Gives a not found status when the topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=topicdoesntexist")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("200: When queried with a limit, only displays a limited number of responses, and defaults to 10", () => {
    return request(app)
      .get("/api/articles?limit=6")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles.length).toBe(6);
        expect(total_count).toBe(13);
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
      })
      .then(() => {
        return request(app)
          .get("/api/articles?limit")
          .expect(200)
          .then(({ body: { articles, total_count } }) => {
            expect(articles.length).toBe(10);
            expect(total_count).toBe(13);
          });
      });
  });
  test("200: When queried with a page number, starts at that specific page", () => {
    return request(app)
      .get("/api/articles?limit&p=2")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles.length).toBe(3);
        expect(total_count).toBe(13);
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
      })
      .then(() => {
        return request(app)
          .get("/api/articles?limit=2&p=4")
          .expect(200)
          .then(({ body: { articles, total_count } }) => {
            expect(articles.length).toBe(2);
            expect(total_count).toBe(13);
          });
      });
  });
  test("200: functionality holds for filters", () => {
    return request(app)
      .get("/api/articles?limit=10&p=2&topic=mitch")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles.length).toBe(2);
        expect(total_count).toBe(12);
      });
  });
  test("200: When queried with an out of bounds page number, returns nothing", () => {
    return request(app)
      .get("/api/articles?limit&p=3")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles.length).toBe(0);
        expect(total_count).toBe(13);
      })
      .then(() => {
        return request(app)
          .get("/api/articles?p=2")
          .expect(200)
          .then(({ body: { articles, total_count } }) => {
            expect(articles.length).toBe(0);
            expect(total_count).toBe(13);
          });
      });
  });
  test("400: Gives bad request status when given an invalid limit", () => {
    return request(app)
      .get("/api/articles?limit=-1")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad limit request");
      });
  });
  test("400: Gives bad request status when given an invalid page", () => {
    return request(app)
      .get("/api/articles?p=-1")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad page request");
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
  test("200: limit query limits the number of responses defaulted to 10", () => {
    return request(app)
      .get("/api/articles/1/comments?limit")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(10);
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
      })
      .then(() => {
        return request(app)
          .get("/api/articles/1/comments?limit=5")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(5);
          });
      });
  });
  test("200: page query shows the correct page with the limited number of entries", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=3")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(1);
      })
      .then(() => {
        return request(app)
          .get("/api/articles/1/comments?limit=5")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(5);
          });
      });
  });
  test("400: page query gives a bad request when given an invalid page", () => {
    return request(app)
      .get("/api/articles/1/comments?p=-1")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad page request");
      })
      .then(() => {
        return request(app)
          .get("/api/articles/1/comments?p=notapagenumber")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad page request");
          });
      });
  });
  test("400: limit query gives a bad request when given an invalid limit", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=-1")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad limit request");
      })
      .then(() => {
        return request(app)
          .get("/api/articles/1/comments?limit=notanumber")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad limit request");
          });
      });
  });
  test("200: out of bounds page should return no comments", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=1&p=12")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(0);
      })
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
  test("404: Gives a bad request status when the username is valid but does not exist", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "hi",
        body: "cool article",
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("username not found");
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
            const initialVotes = rows[0];
            expect(article).toMatchObject({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(String),
              votes: initialVotes.votes + 27,
              article_img_url: expect.any(String),
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
  test("400: Gives a bad request when the article id is invalid", () => {
    return request(app)
      .patch("/api/articles/invalidid")
      .send({
        inc_votes: 56,
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
      .delete("/api/comments/invalidid")
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
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/users/:username ", () => {
  test("200: serves a specific user by username", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toMatchObject({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String),
        });
      });
  });
  test("404: gives a not found status when the username cannot be found", () => {
    return request(app)
      .get("/api/users/usernamedoesntexist")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("username not found");
      });
  });
});

describe("PATCH /api/comments/:comment_id ", () => {
  test("200: votes are incremented by the given parameter", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: 4 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          body: expect.any(String),
          votes: 18,
          author: expect.any(String),
          article_id: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });
  test("404: gives a not found status and message when the comment cannot be found but the id is valid", () => {
    return request(app)
      .patch("/api/comments/238")
      .send({ inc_votes: 4 })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("comment not found");
      });
  });
  test("400: gives a bad request status when the comment id is invalid", () => {
    return request(app)
      .patch("/api/comments/invalidcommentid")
      .send({ inc_votes: 4 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: gives a bad request status when the body does not have the required information", () => {
    return request(app)
      .patch("/api/comments/invalidcommentid")
      .send({})
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: gives a bad request status when the type of inc_votes is invalid", () => {
    return request(app)
      .patch("/api/comments/invalidcommentid")
      .send({ inc_votes: 27.4 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("POST /api/articles ", () => {
  test("201: article is posted and returned", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "icellusedkars",
        title: "theory of cats",
        body: "cats always land on their legs",
        topic: "cats",
      })
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          author: "icellusedkars",
          title: "theory of cats",
          body: "cats always land on their legs",
          topic: "cats",
          article_id: expect.any(Number),
          votes: 0,
          comment_count: 0,
          created_at: expect.any(String),
        });
      });
  });
  test("400: gives bad request if article information is not complete", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "icellusedkars",
        title: "theory of cats",
        topic: "cats",
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: gives bad request if any article information is invalid", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "icellusedkar",
        body: "cats always land on their legs",
        title: "theory of cats",
        topic: "cats",
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});
