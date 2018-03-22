module.exports = app => {
  var moviesController = require("../controllers/movie.controller.js");

  app.get("/movies", moviesController.findAll);
  app.post("/movies", moviesController.addMovies);
};
