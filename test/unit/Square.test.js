const { assert } = require('chai');
const Square = require('../../lib/models/Square');
const { getErrors } = require('./helpers');
const { Types } = require('mongoose');

describe('Square Unit Test', () => {

    it('good valid model', () => {
        const fullInput = {
            coords: {
                x: 0,
                y: 0
            },
            squareDesc: 'A firey, burning hellscape.',
            itemHere: Types.ObjectId(),
            endpointHere: Types.ObjectId()
        };
        const square = new Square(fullInput);
        fullInput._id = square._id;
        assert.deepEqual(square.toJSON(), fullInput);
        assert.isUndefined(square.validateSync());
    });

    it('has required fields', () => {
        const square = new Square({});
        const errors = getErrors(square.validateSync(), 3);
        assert.strictEqual(errors['coords.x'].kind, 'required');
        assert.strictEqual(errors['coords.y'].kind, 'required');
        assert.strictEqual(errors.squareDesc.kind, 'required');
    });

});