require('dotenv').config();
const { assert } = require('chai');
const tokenService = require('../../lib/util/token-service');
const createEnsureAuth = require('../../lib/util/ensure-auth');

describe('ensure auth middleware', () => {

    const user = { _id: 1 };
    let token = '';
    beforeEach(() => token = tokenService.sign(user));

    const ensureAuth = createEnsureAuth();

    it('adds a payload as req.user on success', done => {
        const req = {
            get(header) {
                if(header === 'Authorization') return token;
            }
        };

        const next = () => {
            assert.equal(req.user.id, user._id);
            done();
        };

        ensureAuth(req, null, next);
    });
});