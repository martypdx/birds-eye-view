const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');

const schema = new Schema({
    levelNum: {
        type: Number,
        required: true
    },
    intro: RequiredString,
    squares: [{
        squareId: {
            type: Schema.Types.ObjectId,
            ref: 'Square',
            required: true
        }
    }]
});

schema.statics = {
    identifySquare(levelToMatch, coordsToMatch) {
        return this.aggregate([
            { $match: { levelNum: levelToMatch } },
            { 
                $lookup:
                   {
                       from: 'squares',
                       localField: 'squares.squareId',
                       foreignField: '_id',
                       as: 'square'
                   }
            },
            { $unwind: { path: '$square' } },
            { $match: { 'square.coords': coordsToMatch } },
            { $project: { _id: 1, 'square._id': 1 } }
        ])
        // if this always returns one thing, then add a then here to avoid 
        // array in caller:
            .then(([level]) => level);
    }
};

module.exports = mongoose.model('Level', schema);