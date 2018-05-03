const { assert } = require('chai');
const Hazard = require('../../lib/models/Hazard');
const { getErrors } = require('./helpers');

describe('Hazard model', () => {

    it('is a good, valid model', () => {
        const info = {
            hazardStory: 'You pick up a walnut.'
        };

        const hazard = new Hazard(info);
        info._id = hazard._id;
        assert.deepEqual(hazard.toJSON(), info);
        assert.isUndefined(hazard.validateSync());
    });

    it('has required fields', () => {
        const invalidHazard = new Hazard({});
        const errors = getErrors(invalidHazard.validateSync(), 1);
        assert.strictEqual(errors.hazardStory.kind, 'required');
    });

});