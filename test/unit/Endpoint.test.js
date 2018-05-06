const { assert } = require('chai');
const { Types } = require('mongoose');
const Endpoint = require('../../lib/models/Endpoint');
const { getErrors } = require('./helpers');

describe('Endpoint model', () => {

    it('good valid model', () => {
        const info = {
            requiredItem: Types.ObjectId(),
            endpointStory: {
                unresolved: 'Better luck next time.',
                resolved: 'Good job.'
            }
        };
        
        const endpoint = new Endpoint(info);
        info._id = endpoint._id;
        assert.deepEqual(endpoint.toJSON(), info);
        assert.isUndefined(endpoint.validateSync());
    });

    it('has required fields', () => {
        const invalidEndpoint = new Endpoint({});
        const errors = getErrors(invalidEndpoint.validateSync(), 2);
        assert.strictEqual(errors['endpointStory.unresolved'].kind, 'required');
        assert.strictEqual(errors['endpointStory.resolved'].kind, 'required');
    });

});