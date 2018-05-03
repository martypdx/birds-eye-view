const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken } = require('./db');

describe('Item API', () => {

    before(() => dropCollection('items'));
    before(() => dropCollection('users'));
    
    let adminToken = '';
    before(() => createAdminToken().then(t => adminToken = t));

    let info = {
        itemName: 'walnut',
        itemStory: 'Oh, look. You found a walnut.'
    };

    it('saves an item', () => {
        return request.post('/api/items')
            .set('Authorization', adminToken)
            .send(info)
            .then(({ body }) => {
                const { _id, __v } = body;
                assert.ok(_id);
                assert.strictEqual(__v, 0);
                assert.deepEqual(body, {
                    ...info,
                    _id,
                    __v
                });
            });
    });
});