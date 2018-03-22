var mongoose = require('mongoose');

var MovieSchema = mongoose.Schema({
    id: String,
    title: String,
    original_title: String,
    overview: String,
    popularity: Number,
    vote_average: Number,
    vote_count: Number,
    backdrop_path: String,
    poster_path: String,
    release_date: String,
    runtime: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Movie', MovieSchema);
