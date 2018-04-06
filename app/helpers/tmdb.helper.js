const tmdbConfig = require("../../config/app.config.js").tmdb;
const request = require("request-promise");
const Bottleneck = require("bottleneck");

const limiter = new Bottleneck({
  maxConcurrent: null,
  minTime: 300
});

exports.getMovieByTMDBID = tmdbId => {
  return requestTMDB(getRequestOptionsForMovie(tmdbId)).then(response => {
    return mapTMDBPropertiesToCustomDB(response);
  });
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
      if (isRateLimitError(error)) {
        return wait(getWaitingTimeFromError(error)).then(() =>
          requestTMDB(requestOptions)
        );
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

mapTMDBPropertiesToCustomDB = movieResource => ({
  tmdb_id: movieResource.id,
  tmdb_title: movieResource.title,
  tmdb_original_title: movieResource.original_title,
  tmdb_overview: movieResource.overview,
  tmdb_popularity: movieResource.popularity,
  tmdb_vote_average: movieResource.vote_average,
  tmdb_vote_count: movieResource.vote_count,
  tmdb_backdrop_path: movieResource.backdrop_path,
  tmdb_poster_path: movieResource.poster_path,
  tmdb_release_date: movieResource.release_date,
  tmdb_runtime: movieResource.runtime,
  tmdb_cast: movieResource.credits.cast.map(cast => ({
    tmdb_name: cast.name,
    tmdb_character: cast.character,
    tmdb_profile_path: cast.profile_path
  })),
  tmdb_videos: movieResource.videos.results
    .filter(video => video.site === "YouTube")
    .map(video => ({
      tmdb_video_key: video.key
    }))
});

getRequestOptionsForMovie = tmdbId => {
  return {
    uri:
      tmdbConfig.tmdb_api_url +
      "movie/" +
      tmdbId +
      "?api_key=" +
      tmdbConfig.tmdb_api_key +
      "&language=" +
      tmdbConfig.tmdb_api_language +
      "&append_to_response=videos,images,credits",
    json: true
  };
};

getWaitingTimeFromError = error => error.response.headers["retry-after"] * 1000;

isRateLimitError = error =>
  (error !== undefined) &
  (error.error !== undefined) &
  (error.error.status_code === 25);

wait = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
};
