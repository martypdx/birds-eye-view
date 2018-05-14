const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const { RequiredString } = require('../util/mongoose-helpers');
const Level = require('./Level');

const schema = new Schema({
    name: RequiredString,
    hash: RequiredString,
    inventory: [{
        item: {
            type: Schema.Types.ObjectId, 
            ref: 'Item'
        }
    }],
    visitedSquares: [{
        squareId: {
            type: Schema.Types.ObjectId, 
            ref: 'Square'
        }
    }],
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

schema.statics = {
    getCurrentLevel(id) {
        return this.findById(id)
            .lean()
            .select('currentLevel')
            .populate({
                path: 'currentLevel',
                select: 'levelNum'
            })
            .then(({ currentLevel }) => currentLevel.levelNum);
    }
};

schema.methods = {
    
    generateHash(password) {
        this.hash = bcrypt.hashSync(password, 8);
    },

    comparePassword(password) {
        return bcrypt.compareSync(password, this.hash);
    },

    assignStart() {
        const levelToMatch = 1;
        const coordsToMatch = { x: 0, y: 0 };
        return Level.identifySquare(levelToMatch, coordsToMatch)
            .then(level => {
                if(!level.length) return this;
                this.currentLevel = level[0]._id;
                this.currentSquare = level[0].square._id;
                return this;
            });
        // I mentioned in main submission, go ahead and do a save here...
    }

};

module.exports = mongoose.model('User', schema);

