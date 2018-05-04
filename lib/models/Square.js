const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString, RequiredNumber } = require('../util/mongoose-helpers');

const schema = new Schema({
    coords: {
        x: RequiredNumber,
        y: RequiredNumber
    },
    squareDesc: RequiredString
});

module.exports = mongoose.model('Square', schema);