const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken } = require('./db');
const User = require('../../lib/models/User');

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

    let square2 = {
        coords: {
            x: 1,
            y: 0
        },
        squareDesc: 'You are here. You see things.'
    };
    
    before(() => {
        return request.post('/api/squares')
            .set('Authorization', adminToken)
            .send(square2)
            .then(({ body }) => {
                square2._id = body._id;
            });
    });

    const level = {
        levelNum: 1,
        squares: []
    };

    before(() => {
        level.squares.push({ squareId: square._id });
        level.squares.push({ squareId: square2._id });
        return request.post('/api/levels')
            .set('Authorization', adminToken)
            .send(level)
            .then(({ body }) => {
                level._id = body._id;
            });
    });

    let token = '';

    let user = {
        name: 'Master Blaster',
        password: 'bartertown',
    };

    before(() => {
        return request.post('/api/auth/signup')
            .send(user)
            .then(({ body }) => {
                token = body.token;
                user.id = body.userId;
                return User.findById(user.id);
            })
            .then(u => {
                u.currentLevel = user.currentLevel;
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

    it('gets (and populates) inventory', () => {
        return request.get(`/api/users/${user.id}/inventory`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body.inventory, [{
                    _id: body.inventory[0]._id,
                    item: { _id: square.itemHere, itemName: item.itemName }
                }]);
            });
    });

    it('deletes an item from inventory', () => {
        return request.delete(`/api/users/${user.id}/inventory/${item._id}`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, { removed: { item: item._id } });
            });
    });

    it('clears out a user\'s inventory', () => {
        return request.delete(`/api/users/${user.id}/inventory`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, { cleared: true });
            });
    });

    it('gets initial description', () => {
        return request.get(`/api/users/${user.id}/intro`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body.intro, 'You are here. You see things.');
            });
    });

    it('gets a user\'s current coordinates', () => {
        return request.get(`/api/users/${user.id}/coords`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, square.coords);
            });
    });

    it('gets a user\'s current level', () => {
        return request.get(`/api/users/${user.id}/level`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, { level: level.levelNum });
            });
    });

    it('updates a user\'s square, if one exists in the direction they\'ve tried to move', () => {
        return request.put(`/api/users/${user.id}/square`)
            .send({ x: 1, y: 0 })
            .set('Authorization', token)
            .then(({ body }) => {
                assert.strictEqual(body.currentSquare, square2._id); 
            });
    });
    
    it('returns a falsey value if no square exists', () => {
        return request.put(`/api/users/${user.id}/square`)
            .send({ x: 2, y: 0 })
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, { currentSquare: null }); 
            });
    });

    it('updates a user\'s level, if another exists', () => {
        const level2 = {
            levelNum: 2,
            squares: []
        };

        return request.post('/api/levels')
            .set('Authorization', adminToken)
            .send(level2)
            .then(({ body }) => {
                level2._id = body._id;
                return request.put(`/api/users/${user.id}/level`)
                    .set('Authorization', token)
                    .send({ levelNum: 2 });
            })
            .then(({ body }) => {
                assert.strictEqual(body.currentLevel, level2._id); 
            });
    });
    
    it('returns a falsey value if no level exists', () => {
        return request.put(`/api/users/${user.id}/level`)
            .send({ levelNum: 3 })
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, { currentLevel: null }); 
            });
    });
});