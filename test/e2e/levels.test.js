const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken } = require('./db');


describe('Level API', () => {
    before(() => dropCollection('users'));
    before(() => dropCollection('levels'));
    before(() => dropCollection('squares'));

    let adminToken = '';
    before(() => createAdminToken().then(t => adminToken = t));

    let square = {
        coords: {
            x: 1,
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

    
    it('posts a level', () => {
        const level = {
            levelNum: 1,
            squares: [{
                squareId: square._id
            }]
        };
        return request.post('/api/levels')
            .set('Authorization', adminToken)
            .send(level)
            .then(({ body }) => {
                level.squares[0]._id = body.squares[0]._id;
                const { _id, __v } = body;
                assert.ok(_id);
                assert.strictEqual(__v, 0);
                assert.deepEqual(body, {
                    _id,
                    __v,
                    ...level
                });
            });
    });
});
    
