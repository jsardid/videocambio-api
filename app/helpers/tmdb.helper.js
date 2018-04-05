const tmdbConfig = require("../../config/app.config.js").tmdb;
const request = require("request-promise");
const Bottleneck = require("bottleneck");

const limiter = new Bottleneck({
  maxConcurrent: null,
  minTime: 300
});

exports.getMovieByTMDBID = tmdbId => {
  return requestTMDB(getRequestOptionsForMovie(tmdbId)).then(updateKeys);
};

requestTMDB = requestOptions => {
  return limiter
    .schedule(() => request(requestOptions))
    .then(response => {
      if (response.error) {
        throw error;
      } else {
        return response;
      }
    })
    .catch(error => {
      if (isLimitError(error)) {
        return wait(getDelay(error)).then(() => requestTMDB(requestOptions));
      } else {
        throw {
          id: tmdbId,
          error: {
            type: "TMDBError",
            error_details: error
          }
        };
      }
    });
};

updateKeys = movie =>
  Object.keys(movie).reduce((updatedMovie, originalKey) => {
    updatedMovie["tmdb_" + originalKey] = movie[originalKey];
    return updatedMovie;
  }, {});

getRequestOptionsForMovie = tmdbId => {
  return {
    uri:
      tmdbConfig.tmdb_api_url +
      "movie/" +
      tmdbId +
      "?api_key=" +
      tmdbConfig.tmdb_api_key +
      "&language=" +
      tmdbConfig.tmdb_api_language,
    json: true
  };
};

getDelay = error => error.response.headers["retry-after"] * 1000;

isLimitError = error =>
  (error !== undefined) &
  (error.error !== undefined) &
  (error.error.status_code === 25);

wait = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
};
