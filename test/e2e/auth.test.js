const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken, postData } = require('./db');
const { square1Data, level1Data, userData } = require('./test-data');
const User = require('../../lib/models/User');

describe('Auth API', () => {

    before(() => dropCollection('squares'));
    before(() => dropCollection('levels'));
    before(() => dropCollection('users'));
    
    let adminToken = '';
    before(() => createAdminToken().then(t => adminToken = t));

    let square = { ...square1Data };
    let level = { ...level1Data };    
    let user = { ...userData };

    before(() => postData('/api/squares', square, adminToken).then(body => square._id = body._id));
    
    before(() => {
        level.squares.push({ squareId: square._id });
        return postData('/api/levels', level, adminToken)
            .then(body => {
                level._id = body._id;
            });
    });

    let token = '';

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
    
    it('assigns user a starting square', () => {
        return User.findById(user.id)
            .then(user => {
                assert.strictEqual(user.currentLevel.toJSON(), level._id);                
                assert.strictEqual(user.currentSquare.toJSON(), level.squares[0].squareId);
            });
    });

});