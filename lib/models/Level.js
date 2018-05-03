const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');

const schema = new Schema({
    levelNum: {
        type: Number,
        required: true
    },
    introDesc: RequiredString,
    squares: [{
        squareId: {
            type: Schema.Types.ObjectId,
            ref: 'Square',
            required: true
        },
        itemId: {
            type: Schema.Types.ObjectId,
            ref: 'Item'
        },
        endpointId: {
            type: Schema.Types.ObjectId,
            ref: 'Endpoint'
        }
    }]
});

module.exports = mongoose.model('Level', schema);