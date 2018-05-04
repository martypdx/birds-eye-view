const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString, RequiredNumber } = require('../util/mongoose-helpers');

const schema = new Schema({
    coords: {
        x: RequiredNumber,
        y: RequiredNumber
    },
    squareDesc: RequiredString,
    itemHere: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
    },
    endpointHere: {
        type: Schema.Types.ObjectId,
        ref: 'Endpoint'
    }
});

module.exports = mongoose.model('Square', schema);