const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var AttractionSchema = new Schema();

module.exports = mongoose.model('Attraction', AttractionSchema);