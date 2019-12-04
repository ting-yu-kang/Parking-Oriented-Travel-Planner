const mongoose = require('mongoose');
var random = require('mongoose-simple-random');
const Schema = mongoose.Schema;

var ParkingSchema = new Schema();
ParkingSchema.plugin(random);

module.exports = mongoose.model('Parking', ParkingSchema);