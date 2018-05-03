const { assert } = require('chai');
const { Types } = require('mongoose');
const Level = require('../../lib/models/Level');
const { getErrors } = require('./helpers');

describe('Level Model', () => {
    
    it('is a valid good model', () => {
        const data = {
            levelNum: 1,
            squares: [{
                squareId: Types.ObjectId(),
                itemId: Types.ObjectId(),
                endpointId: Types.ObjectId()
            }]
        };
        const level = new Level(data);
        data._id = level._id;
        assert.ok(level.levelNum);
        assert.ok(level.squares);
    });

    it('has required fields', () => {
        const level = new Level({});
        const errors = getErrors(level.validateSync(), 1);
        assert.strictEqual(errors.levelNum.kind, 'required');
    });
});