const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken } = require('./db');
const User = require('../../lib/models/User');

describe('Auth API', () => {

    before(() => dropCollection('squares'));
    before(() => dropCollection('levels'));
    before(() => dropCollection('users'));
    
    let adminToken = '';
    before(() => createAdminToken().then(t => adminToken = t));

    
    let square = {
        coords: {
            x: 0,
            y: 0
        },
        squareDesc: 'You are here. You see things.'
    };
    
    before(() => {
        return request.post('/api/squares')
            .set('Authorization', adminToken)
            .send(square)
            .then(({ body }) => {
                square._id = body._id;
            });
    });

    const level = {
        levelNum: 1,
        squares: []
    };

    before(() => {
        level.squares.push({ squareId: square._id });
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
            });
    });

    it('has a functional signup route', () => {
        assert.ok(token);
    });

    it('has a functional verify route', () => {
        return request.get('/api/auth/verify')
            .set('Authorization', token)
            .then(({ body }) => {
                assert.ok(body.verified);
            });
    });

    it('has a functional signin route', () => {
        return request.post('/api/auth/signin')
            .send({
                name: 'Master Blaster',
                password: 'bartertown'
            })
            .then(({ body }) => {
                assert.ok(body.token);
            });
    });
    
    it('assigns user a starting square and level', () => {
        return User.findById(user.id)
            .then(user => {
                assert.strictEqual(user.currentLevel.toJSON(), level._id);
                assert.strictEqual(user.currentSquare.toJSON(), level.squares[0].squareId);
            });
    });

});