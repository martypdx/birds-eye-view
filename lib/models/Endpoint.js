const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');

const schema = new Schema({
    requiredItem: { 
        type: Schema.Types.ObjectId,
        ref: 'Item',
    },
    endpointStory: {
        unresolved: RequiredString,
        resolved: RequiredString
    }
});

module.exports = mongoose.model('Endpoint', schema);