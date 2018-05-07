const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken, postData } = require('./db');
const { item1Data, item2Data, square1Data, square2Data, userData, level1Data, level2Data } = require('./test-data');
const User = require('../../lib/models/User');

describe('User API', () => {

    before(() => dropCollection('squares'));
    before(() => dropCollection('levels'));
    before(() => dropCollection('items'));
    before(() => dropCollection('users'));
    
    let adminToken = '';
    before(() => createAdminToken().then(t => adminToken = t));

    let item1 = { ...item1Data };
    let item2 = { ...item2Data };
    let square1 = { ...square1Data };    
    let square2 = { ...square2Data };    
    let level1 = { ...level1Data };    
    let level2 = { ...level2Data };
    let user = { ...userData };    

    before(() => postData('/api/items', item1, adminToken).then(body => item1._id = body._id));
    before(() => postData('/api/items', item2, adminToken).then(body => item2._id = body._id));

    before(() => {
        square1.itemHere = item1._id;        
        return postData('/api/squares', square1, adminToken)
            .then(body => {
                square1._id = body._id;
            });
    });
    
    before(() => postData('/api/squares', square2, adminToken).then(body => square2._id = body._id));

    before(() => {
        level1.squares.push({ squareId: square1._id });
        level1.squares.push({ squareId: square2._id });
        return postData('/api/levels', level1, adminToken)
            .then(body => {
                level1._id = body._id;
            });
    });

    let token = '';

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
            .send({ item: square1.itemHere })
            .then(({ body }) => {
                assert.deepEqual(body.inventory, [{
                    _id: body.inventory[0]._id,
                    ...{ item: square1.itemHere }
                }]);
                user.inventory = body.inventory;
            });
    });
    
    it('gets (and populates) an item in inventory', () => {
        return request.get(`/api/users/${user.id}/inventory/${item1._id}`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body.itemName, item1.itemName);
            });
    });
    
    it('deletes an item from inventory', () => {
        return request.delete(`/api/users/${user.id}/inventory/${item1._id}`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, { removed: { item: item1._id } });
            });
    });

    it('clears out a user\'s inventory', () => {
        return request.delete(`/api/users/${user.id}/inventory`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, { cleared: true });
            });
    });

    it('returns a falsey value if an item isn\'t in inventory', () => {
        return request.get(`/api/users/${user.id}/inventory/${item1._id}`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.isNull(body.itemName);
            });
    });

    it('gets a customized game introduction', () => {
        return request.get(`/api/users/${user.id}/intro`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.include(body.intro, user.name);
                assert.include(body.intro, square1.squareDesc);
            });
    });

    it('gets a user\'s current square and coordinates', () => {
        return request.get(`/api/users/${user.id}/position`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, {
                    coords: square1.coords,
                    _id: square1._id
                });
            });
    });
    
    it('gets a user\'s current square', () => {
        return request.get(`/api/users/${user.id}/square`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body.currentSquare, square1._id);
            });
    });

    it('gets a user\'s current level', () => {
        return request.get(`/api/users/${user.id}/level`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, { level: level1.levelNum });
            });
    });

    it('returns a falsey value if a user has not visited a square', () => {
        return request.get(`/api/users/${user.id}/visited/${square2._id}`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.notOk(body.visited);
            });
    });

    it('updates a user\'s square, if one exists in the direction they\'ve tried to move', () => {
        return request.put(`/api/users/${user.id}/square`)
            .send({ coords: { x: 1, y: 0 }, squareId: square1._id })
            .set('Authorization', token)
            .then(({ body }) => {
                assert.strictEqual(body.currentSquare, square2._id); 
            });
    });
    
    it('returns a falsey value if no square exists', () => {
        return request.put(`/api/users/${user.id}/square`)
            .send({ coords: { x: 2, y: 0 }, squareId: square2._id })
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, { currentSquare: null }); 
            });
    });

    it('checks if a user has visited a square', () => {
        return request.get(`/api/users/${user.id}/visited/${square1._id}`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.ok(body.visited);
            });
    });

    it('updates a user\'s level, if another exists', () => {
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

    it('clears a user\'s visited squares', () => {
        return request.delete(`/api/users/${user.id}/visited`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, { cleared: true });
            });
    });

    it('creates a new game', () => {
        return request.post(`/api/users/${user.id}/game`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body.currentLevel, level1._id); 
                assert.deepEqual(body.currentSquare, square1._id); 
            });
    });
});