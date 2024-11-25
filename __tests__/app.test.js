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
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("404", () => {
  test("200: Responds with a 404 status indicating page cannot be found", () => {
    return request(app)
      .get("/zsdxfcg")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("page not found");
      });
  });
});
