const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken } = require('./db');

describe('Square API', () => {

    before(() => dropCollection('squares'));
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
                item._id = body._id;                
                endpoint.requiredItem = body._id;
            });
    });

    before(() => {
        return request.post('/api/endpoints')
            .set('Authorization', adminToken)
            .send(endpoint)
            .then(({ body }) => {
                endpoint._id = body._id;
            });
    });

    let square = {
        coords: {
            x: 1,
            y: 0
        },
        squareDesc: 'You are here. You see things.'
    };

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