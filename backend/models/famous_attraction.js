const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Famous_attractionSchema = new Schema();

module.exports = mongoose.model('Famous_attraction', Famous_attractionSchema);