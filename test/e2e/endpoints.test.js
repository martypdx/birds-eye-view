const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken, postData } = require('./db');
const { item1Data, endpointData } = require('./test-data');

describe('Endpoint API', () => {

    before(() => dropCollection('items'));
    before(() => dropCollection('endpoints'));
    before(() => dropCollection('users'));
    
    let adminToken = '';
    before(() => createAdminToken().then(t => adminToken = t));

    let item = { ...item1Data };
    let endpoint = { ...endpointData };

    before(() => postData('/api/items', item, adminToken).then(body => endpoint.requiredItem = body._id));    

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