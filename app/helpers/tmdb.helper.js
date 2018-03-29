const tmdbConfig = require("../../config/app.config.js").tmdb;
const request = require("request-promise");
let numberOfOngoingRequests = 0;

getMovieByTMDBID = tmdbId => {
  let timeToWait = numberOfOngoingRequests * 250;
  numberOfOngoingRequests++;
  return wait(timeToWait)
    .then(() =>
      request({
        uri: buildURI(tmdbId),
        json: true
      })
    )
    .then(response => {
      if (response.error) {
        throw error;
      } else {
        numberOfOngoingRequests--;
        return updateKeys(response);
      }
    })
    .catch(error => {
      numberOfOngoingRequests--;
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

updateKeys = movie =>
  Object.keys(movie).reduce((updatedMovie, originalKey) => {
    updatedMovie["tmdb_" + originalKey] = movie[originalKey];
    return updatedMovie;
  }, {});

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
