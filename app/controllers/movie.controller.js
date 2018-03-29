var MovieModel = require("../models/movie.model.js");
var tmdbHelper = require("../helpers/tmdb.helper.js");

exports.findAll = (req, res) => {
  MovieModel.find(function(err, movies) {
    if (err) {
      console.log(err);
      res
        .status(500)
        .send({ message: "Some error occurred while retrieving movies." });
    } else {
      res.send(movies);
    }
  });
};

exports.addMovies = (req, res) => {
  const moviesToAdd = Array.isArray(req.body) ? req.body : [req.body];
  Promise.all(moviesToAdd.map(addMovie)).then(results => {
    res.send(results);
  });
};

addMovie = movieIDToAdd => {
  return tmdbHelper
    .getMovieByTMDBID(movieIDToAdd)
    .then(movie => addMovieToDatabase(movie))
    .catch(error => error);
};

addMovieToDatabase = movie =>
  MovieModel.findOneAndUpdate({ tmdb_id: movie.tmdb_id }, movie, {
    upsert: true,
    setDefaultsOnInsert: true
  })
    .then(() => {
      return {
        id: movie.id,
        title: movie.original_title
      };
    })
    .catch(error => {
      throw {
        id: movie.id,
        title: movie.original_title,
        error: {
          type: "addMovieToDatabase",
          error_details: error
        }
      };
    });
