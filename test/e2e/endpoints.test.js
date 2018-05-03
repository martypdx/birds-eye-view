const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken } = require('./db');

describe('Endpoint API', () => {

    before(() => dropCollection('endpoints'));
    before(() => dropCollection('users'));
    
    let adminToken = '';
    before(() => createAdminToken().then(t => adminToken = t));

    let item = {
        itemName: 'walnut',
        itemStory: 'Oh, look. You found a walnut.'
    };
    
    let endpoint = {
        endpointStory: {
            unresolved: 'Nope not yet.',
            resolved: 'You may pass.'
        }
    };

    before(() => {
        return request.post('/api/items')
            .set('Authorization', adminToken)
            .send(item)
            .then(({ body }) => {
                endpoint.requiredItem = body._id;
            });
    });

    it('saves an endpoint', () => {
        return request.post('/api/endpoints')
            .set('Authorization', adminToken)
            .send(endpoint)
            .then(({ body }) => {
                const { _id, __v } = body;
                assert.ok(_id);
                assert.strictEqual(__v, 0);
                assert.deepEqual(body, {
                    ...endpoint,
                    _id,
                    __v
                });
            });
    });
});