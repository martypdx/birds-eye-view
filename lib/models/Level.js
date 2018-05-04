const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    levelNum: {
        type: Number,
        required: true
    },
    squares: [{
        squareId: {
            type: Schema.Types.ObjectId,
            ref: 'Square',
            required: true
        }
    }]
});

module.exports = mongoose.model('Level', schema);