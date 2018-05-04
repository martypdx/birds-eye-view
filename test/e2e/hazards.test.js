const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken } = require('./db');

describe('Hazard API', () => {

    before(() => dropCollection('hazards'));
    before(() => dropCollection('users'));
    
    let adminToken = '';
    before(() => createAdminToken().then(t => adminToken = t));

    let hazard = {
        hazardStory: 'Eep, a fox. You die.'
    };

    it('saves a hazard', () => {
        return request.post('/api/hazards')
            .set('Authorization', adminToken)
            .send(hazard)
            .then(({ body }) => {
                const { _id, __v } = body;
                assert.ok(_id);
                assert.strictEqual(__v, 0);
                assert.deepEqual(body, {
                    ...hazard,
                    _id,
                    __v
                });
                hazard._id = body._id;
            });
    });
    
    it('gets a random hazard', () => {
        let hazard2 = {
            hazardStory: 'Oh no, a cat.'
        };

        return request.post('/api/hazards')
            .set('Authorization', adminToken)
            .send(hazard2)
            .then(({ body }) => {
                hazard2._id = body._id;
                return request.get('/api/hazards')
                    .set('Authorization', adminToken);
            })
            .then(({ body }) => {
                assert.ok(body._id);
                assert.ok(body.hazardStory);
            });
    });
});