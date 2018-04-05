var MovieModel = require("../models/movie.model.js");
var tmdbHelper = require("../helpers/tmdb.helper.js");

exports.findAll = (req, res) => {
  const limit =
    (req.query && req.query.limit && parseInt(req.query.limit)) || 0;
  const offset =
    (req.query && req.query.offset && parseInt(req.query.offset)) || 0;
  const query =
    (req.query && req.query.title && { $text: { $search: req.query.title } }) ||
    {};
  const sort_by =
    (req.query && req.query.sort_by && { [req.query.sort_by]: "desc" }) || {};

  MovieModel.find(query)
    .sort(sort_by)
    .skip(offset)
    .limit(limit)
    .exec(function(err, movies) {
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

exports.findOne = function(req, res) {
  MovieModel.find({ tmdb_id: req.params.movieId }, (err, results) => {
    if (err) {
      console.log(err);
      if (err.kind === "ObjectId") {
        return res
          .status(404)
          .send({ message: "Movie not found with id " + req.params.movieId });
      }
      return res.status(500).send({
        message: "Error retrieving movie with id " + req.params.movieId
      });
    }
    if (!results || !results.length) {
      return res
        .status(404)
        .send({ message: "Movie not found with id " + req.params.movieId });
    }
    res.send(results[0]);
  });
};

addMovie = movieIDToAdd =>
  tmdbHelper
    .getMovieByTMDBID(movieIDToAdd)
    .then(addMovieToDatabase)
    .catch(error => error);

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
