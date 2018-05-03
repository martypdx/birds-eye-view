const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const { RequiredString } = require('../util/mongoose-helpers');
const Level = require('./Level');

const schema = new Schema({
    name: RequiredString,
    hash: RequiredString,
    inventory: [String],
    currentLevel: {
        type: Schema.Types.ObjectId, 
        ref: 'Level'
    },
    currentSquare: {
        type: Schema.Types.ObjectId, 
        ref: 'Square'
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

    startLocal() {
        return Level.findOne({ levelNum: 1 })
            .lean()
            .select('squares')
            .populate({
                path: 'squareId',
                populate: {
                    match: { coords: { x: 0, y: 0 } },
                    select: '_id'
                }
            })
            .then(local => {
                if(!local) return this;
                this.currentSquare = local._id;
                return this;
            });

    }

};

module.exports = mongoose.model('User', schema);

