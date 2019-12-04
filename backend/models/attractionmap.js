const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var AttrmapSchema = new Schema();

module.exports = mongoose.model('Attrmap', AttrmapSchema);