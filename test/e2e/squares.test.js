const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken, postData } = require('./db');
const { item1Data, endpointData, square1Data } = require('./test-data');

describe('Square API', () => {
    
    before(() => dropCollection('items'));
    before(() => dropCollection('endpoints'));
    before(() => dropCollection('squares'));
    before(() => dropCollection('users'));
    
    let adminToken = '';
    before(() => createAdminToken().then(t => adminToken = t));
    
    let item = { ...item1Data };
    let endpoint = { ...endpointData };
    let square = { ...square1Data };

    before(() => {
        return postData('/api/items', item, adminToken)
            .then(body => {
                item._id = body._id;                
                endpoint.requiredItem = body._id;
            });
    });
    
    before(() => postData('/api/endpoints', endpoint, adminToken).then(body => endpoint._id = body._id));

    it('saves a square', () => {
        square.itemHere = item._id;
        square.endpointHere = endpoint._id;
        return request.post('/api/squares')
            .set('Authorization', adminToken)
            .send(square)
            .then(({ body }) => {
                const { _id, __v } = body;
                assert.ok(_id);
                assert.strictEqual(__v, 0);
                assert.deepEqual(body, {
                    ...square,
                    _id,
                    __v
                });
                square._id = _id;
            });
    });

    it('gets populated game info from a square', () => {
        return request.get(`/api/squares/${square._id}`)
            .set('Authorization', adminToken)
            .then(({ body }) => {
                assert.ok(body.squareDesc);
                assert.ok(body.itemHere.itemName);
                assert.ok(body.endpointHere.requiredItem.itemName);
            });
    });
});