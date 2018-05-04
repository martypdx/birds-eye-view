const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken } = require('./db');

describe('User API', () => {

    before(() => dropCollection('squares'));
    before(() => dropCollection('levels'));
    before(() => dropCollection('users'));
    
    let adminToken = '';
    before(() => createAdminToken().then(t => adminToken = t));

    let item = {
        itemName: 'walnut',
        itemStory: 'Oh, look. You found a walnut.'
    };

    before(() => {
        return request.post('/api/items')
            .set('Authorization', adminToken)
            .send(item)
            .then(({ body }) => {
                item._id = body._id;
            });
    });

    let square = {
        coords: {
            x: 0,
            y: 0
        },
        squareDesc: 'You are here. You see things.'
    };
 
    before(() => {
        square.itemHere = item._id;
        return request.post('/api/squares')
            .set('Authorization', adminToken)
            .send(square)
            .then(({ body }) => {
                square._id = body._id;
            });
    });

    before(() => {
        const level = {
            levelNum: 1,
            squares: [{
                squareId: square._id
            }]
        };
        return request.post('/api/levels')
            .set('Authorization', adminToken)
            .send(level)
            .then();
    });

    let token = null;

    let user = {
        name: 'Master Blaster',
        password: 'bartertown',
    };

    before(() => {
        return request.post('/api/auth/signup')
            .send(user)
            .then(({ body }) => {
                user.id = body.userId;
                token = body.token;
            });
    });

    it('adds an item to inventory', () => {
        return request.post(`/api/users/${user.id}/inventory`)
            .set('Authorization', token)
            .send({ item: square.itemHere })
            .then(({ body }) => {
                assert.deepEqual(body.inventory, [{
                    _id: body.inventory[0]._id,
                    ...{ item: square.itemHere }
                }]);
                user.inventory = body.inventory;
            });
    });

    it('gets inventory', () => {
        return request.get(`/api/users/${user.id}/inventory`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body.inventory, user.inventory);
            });
    });

    it('deletes an item from inventory', () => {
        return request.delete(`/api/users/${user.id}/inventory/${item._id}`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, { removed: { item: item._id } });
            });
    });

    it('gets a user\'s current coordinates', () => {
        return request.get(`/api/users/${user.id}/coords`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, square.coords);
            });
    });
  
    it('gets initial description', () => {
        return request.get(`/api/users/${user.id}/intro`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body.intro, 'You are here. You see things.');
            });
    });
});