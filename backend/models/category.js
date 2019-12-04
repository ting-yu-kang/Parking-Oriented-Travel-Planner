const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CategorySchema = new Schema();

module.exports = mongoose.model('Category', CategorySchema);