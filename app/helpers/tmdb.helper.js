const tmdbConfig = require("../../config/app.config.js").tmdb;
const request = require("request-promise");
const Bottleneck = require("bottleneck");

const limiter = new Bottleneck({
  maxConcurrent: null,
  minTime: 300
});
const mapTMDBPropertiesToCustomDB = movieResource => ({
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

const getRequestOptionsForMovie = tmdbId => ({
  uri: `
      ${tmdbConfig.tmdb_api_url}movie/${tmdbId}?api_key=${
    tmdbConfig.tmdb_api_key
  }&language=${
    tmdbConfig.tmdb_api_language
  }&append_to_response=videos,images,credits
  `,
  json: true
});

const getWaitingTimeFromError = error =>
  error.response.headers["retry-after"] * 1000;

const isRateLimitError = error =>
  error !== undefined &&
  error.error !== undefined &&
  error.error.status_code === 25;

const wait = time =>
  new Promise(resolve => {
    setTimeout(resolve, time);
  });

const requestTMDB = requestOptions =>
  limiter
    .schedule(() => request(requestOptions))
    .then(response => {
      if (response.error) {
        throw new Error(response.error);
      } else {
        return response;
      }
    })
    .catch(error => {
      if (isRateLimitError(error)) {
        return wait(getWaitingTimeFromError(error)).then(() =>
          requestTMDB(requestOptions)
        );
      }
      throw new Error({
        error: {
          type: "TMDBError",
          error_details: error
        }
      });
    });

exports.getMovieByTMDBID = tmdbId =>
  requestTMDB(getRequestOptionsForMovie(tmdbId)).then(response =>
    mapTMDBPropertiesToCustomDB(response)
  );
