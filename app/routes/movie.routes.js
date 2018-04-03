module.exports = app => {
  var moviesController = require("../controllers/movie.controller.js");

  app.get("/movies", moviesController.findAll);
  app.get('/movies/:movieId', moviesController.findOne);
  app.post("/movies", moviesController.addMovies);
};
