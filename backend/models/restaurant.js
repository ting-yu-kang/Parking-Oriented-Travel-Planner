const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var RestaurantSchema = new Schema();

module.exports = mongoose.model('Restaurant', RestaurantSchema);