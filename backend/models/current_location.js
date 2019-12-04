const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Current_locationSchema = new Schema();

module.exports = mongoose.model('Currentlocation', Current_locationSchema);