const MovieModel = require("../models/movie.model.js");
const tmdbHelper = require("../helpers/tmdb.helper.js");

const addMovieToDatabase = movie =>
  MovieModel.findOneAndUpdate({ tmdb_id: movie.tmdb_id }, movie, {
    upsert: true,
    setDefaultsOnInsert: true
  })
    .then(() => ({
      id: movie.id,
      title: movie.original_title
    }))
    .catch(error => {
      throw new Error({
        id: movie.id,
        title: movie.original_title,
        error: {
          type: "addMovieToDatabase",
          error_details: error
        }
      });
    });

const addMovie = movieIDToAdd =>
  tmdbHelper
    .getMovieByTMDBID(movieIDToAdd)
    .then(addMovieToDatabase)
    .catch(error => error);

exports.findAll = (req, res) => {
  const limit =
    (req.query && req.query.limit && parseInt(req.query.limit, 10)) || 0;
  const offset =
    (req.query && req.query.offset && parseInt(req.query.offset, 10)) || 0;
  const query =
    (req.query &&
      req.query.title && {
        $and: req.query.title
          .replace(/,/g, " ")
          .trim()
          .replace(/a|á|A|Á/g, "[aáAÁ]")
          .replace(/e|é|E|É/g, "[eéEÉ]")
          .replace(/i|í|I|Í/g, "[iíIÍ]")
          .replace(/o|ó|O|Ó/g, "[oóOÓ]")
          .replace(/u|ú|U|Ú/g, "[uúUÚ]")
          .split(" ")
          .map(word => ({ tmdb_title: { $regex: new RegExp(word, "i") } }))
      }) ||
    {};
  const sortBy =
    (req.query && req.query.sort_by && { [req.query.sort_by]: "desc" }) || {};

  MovieModel.find(query)
    .sort(sortBy)
    .skip(offset)
    .limit(limit)
    .exec((err, movies) => {
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

exports.findOne = (req, res) => {
  MovieModel.find({ tmdb_id: req.params.movieId }, (err, results) => {
    if (err) {
      console.log(err);
      if (err.kind === "ObjectId") {
        return res
          .status(404)
          .send({ message: `Movie not found with id ${req.params.movieId}` });
      }
      return res.status(500).send({
        message: `Error retrieving movie with id ${req.params.movieId}`
      });
    }
    if (!results || !results.length) {
      return res
        .status(404)
        .send({ message: `Movie not found with id ${req.params.movieId}` });
    }
    return res.send(results[0]);
  });
};
