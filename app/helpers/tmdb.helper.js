const tmdbConfig = require("../../config/app.config.js").tmdb;
var request = require("request-promise");

getMovieByTMDBID = tmdbId => {
  return request({
    uri: buildURI(tmdbId),
    json: true
  })
    .then(response => {
      if (response.error) {
        throw error;
      } else {
        return response;
      }
    })
    .catch(error => {
      if (isLimitError(error)) {
        return wait(getDelay(error)).then(() => getMovieByTMDBID(tmdbId));
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

buildURI = tmdbId =>
  tmdbConfig.tmdb_api_url +
  "movie/" +
  tmdbId +
  "?" +
  tmdbConfig.tmdb_api_params;

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

exports.getMovieByTMDBID = getMovieByTMDBID;
