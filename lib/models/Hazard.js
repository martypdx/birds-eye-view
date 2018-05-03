const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');

const schema = new Schema({
    hazardStory: RequiredString
});

module.exports = mongoose.model('Hazard', schema);