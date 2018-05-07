const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');

const schema = new Schema({
    itemName: RequiredString,
    itemStory: RequiredString
});

module.exports = mongoose.model('Item', schema);