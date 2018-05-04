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
            });
    });
});