const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken, postData } = require('./db');
const { square1Data, level1Data } = require('./test-data');

describe('Level API', () => {
    before(() => dropCollection('squares'));
    before(() => dropCollection('levels'));
    before(() => dropCollection('users'));

    let adminToken = '';
    before(() => createAdminToken().then(t => adminToken = t));

    let square = { ...square1Data };
    let level = { ...level1Data };

    before(() => postData('/api/squares', square, adminToken).then(body => square._id = body._id));
    
    it('posts a level', () => {
        level.squares = [{ squareId: square._id }];
        
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
    
