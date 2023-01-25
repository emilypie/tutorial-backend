

describe("tutorials controller", () => {
  const findAllFunction = jest.fn().mockResolvedValue(Promise.resolve([]));
  const db = jest.mock("../../app/models", () => ({
    sequelize: {
      sync: jest.fn()
    },
    Sequelize: {
      Op: jest.fn()
    },
    tutorial: {
      findAll: findAllFunction
    }
  }));
  const authFunction = jest.fn().mockImplementation((req, res, next) => next());
  const authenticate = jest.mock("../../app/authorization/authorization.js", () => ({
    authenticate: authFunction
  }));

  const app = require("../../server.js");
  const request = require("supertest");

  var testTutorial = {
    title: "Automated Testing Tutorial",
    description:
      "This tutorial shows an example test suite of a NodeJS backend",
    published: false,
  };

  describe("get tutorials list", () => {
    it("authenticates the user", async () => {
      findAllFunction.mockResolvedValue(Promise.resolve([]));
      await request(app)
        .get("/tutorial/tutorials")
        .then((response) => {
          expect(authFunction).toHaveBeenCalled();
        });
    });

    it("calls findAll without query", async () => {
      findAllFunction.mockResolvedValue(Promise.resolve([]));
      await request(app)
        .get("/tutorial/tutorials")
        .expect(200)
        .then((response) => {
          expect(findAllFunction).toHaveBeenCalled();
        });
    });

    it("calls findAll with query", async () => {
      findAllFunction.mockResolvedValue(Promise.resolve([]));
      await request(app)
        .get("/tutorial/tutorials?title=Automated")
        .expect(200)
        .then((response) => {
          expect(findAllFunction).toHaveBeenCalledWith({
            where: {
              title: {
                [db.Sequelize.Op.like]: "%Automated%",
              },
            },
          });
        });
    });

    it("responds with results from findAll", async () => {
      findAllFunction
        .mockResolvedValue(Promise.resolve([testTutorial]));
      await request(app)
        .get("/tutorial/tutorials")
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveLength(1);
          expect(response.body[0]).toMatchObject(testTutorial);
        });
    });

    it("responds with 500 and message on error", async () => {
      findAllFunction
        .mockImplementation(() =>
          Promise.reject(new Error("Fake error from test"))
        );
      await request(app)
        .get("/tutorial/tutorials")
        .expect(500)
        .then((response) => {
          expect(response.body.message).toBe("Fake error from test");
        });
    });
  });
});
