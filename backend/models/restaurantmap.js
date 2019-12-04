const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var RestmapSchema = new Schema();

module.exports = mongoose.model('Restmap', RestmapSchema);