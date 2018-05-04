const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const { RequiredString } = require('../util/mongoose-helpers');
const Level = require('./Level');

const schema = new Schema({
    name: RequiredString,
    hash: RequiredString,
    inventory: [String],
    currentSquare: {
        type: Schema.Types.ObjectId, 
        ref: 'Square'
    },
    currentLevel: {
        type: Schema.Types.ObjectId, 
        ref: 'Level'
    },
    roles: [String]
});

schema.methods = {
    
    generateHash(password) {
        this.hash = bcrypt.hashSync(password, 8);
    },

    comparePassword(password) {
        return bcrypt.compareSync(password, this.hash);
    },

    assignStart() {
        return Level.findOne({ levelNum: 1 })
            .lean()
            .select('squares')
            .populate({
                path: 'squares.squareId',
                match: { coords: { x: 0, y: 0 } },
                select: '_id'
            })
            .then(level => {
                if(!level || !level.squares[0].squareId) return this;
                this.currentLevel = level._id;
                this.currentSquare = level.squares[0].squareId._id;
                return this;
            });

    }

};

module.exports = mongoose.model('User', schema);

