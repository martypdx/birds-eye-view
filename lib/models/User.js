const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const { RequiredString } = require('../util/mongoose-helpers');
const shuffle = require('../util/shuffle');

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

    assignTask(number) {
        return Promise.all([
            Task.findOne({ number: number }),
            Fluff.aggregate([
                { $sample: { size: 2 } }
            ])
        ])
            .then(([task, fluffs]) => {
                if(!task || fluffs.length === 0) return this;
                this.currentTask = task._id;

                const dirs = ['n', 's', 'e', 'w'];
                const randomizedDirs = shuffle(dirs);
                this.options[randomizedDirs[0]] = { action: 'interact' };
                this.options[randomizedDirs[1]] = { action: 'resolve' };
                this.options[randomizedDirs[2]] = { action: 'look', fluff: fluffs[0]._id };
                this.options[randomizedDirs[3]] = { action: 'look', fluff: fluffs[1]._id };
                return this;
            });
    }

};

module.exports = mongoose.model('User', schema);

