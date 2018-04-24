const moviesController = require("../controllers/movie.controller.js");

module.exports = app => {
  app.get("/movies", moviesController.findAll);
  app.get("/movies/:movieId", moviesController.findOne);
  app.post("/movies", moviesController.addMovies);
};
