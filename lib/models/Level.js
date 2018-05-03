const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');

const schema = new Schema({
    levelNum: {
        type: Number,
        required: true
    },
    introDesc: RequiredString,
    itemSquares: [{
        itemId: {
            type: Schema.Types.ObjectId,
            ref: 'Item'
        },
        squareId: {
            type: Schema.Types.ObjectId,
            ref: 'Square'
        }
    }],
    endpointSquares: [{
        itemId: {
            type: Schema.Types.ObjectId,
            ref: 'Endpoint'
        },
        squareId: {
            type: Schema.Types.ObjectId,
            ref: 'Square'
        }
    }]
});

module.exports = mongoose.model('Level', schema);