var mongoose = require("mongoose");

var MovieSchema = mongoose.Schema(
  {
    custom_popular: {
      type: Boolean,
      default: false
    },
    custom_new_release: {
      type: Boolean,
      default: false
    },
    custom_recently_added: {
      type: Boolean,
      default: false
    },
    tmdb_id: String,
    tmdb_title: String,
    tmdb_original_title: String,
    tmdb_overview: String,
    tmdb_popularity: Number,
    tmdb_vote_average: Number,
    tmdb_vote_count: Number,
    tmdb_backdrop_path: String,
    tmdb_poster_path: String,
    tmdb_release_date: String,
    tmdb_runtime: String,
    tmdb_cast: [
      {
        tmdb_name: String,
        tmdb_character: String,
        tmdb_profile_path: String
      }
    ],
    tmdb_videos: [
      {
        tmdb_youtube_link: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Movie", MovieSchema);
