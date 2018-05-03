const { assert } = require('chai');
const { Types } = require('mongoose');
const User = require('../../lib/models/User');
const { getErrors } = require('./helpers');

describe('User model', () => {

    it('good valid model', () => {
        const fullInput = {
            name: 'Tasha Zuniga',
            hash: 'notpassword',
            inventory: [],
            currentLevel: Types.ObjectId(),
            currentSquare: Types.ObjectId(),
            roles: ['theBoss']
        };
        const user = new User(fullInput);
        fullInput._id = user._id;
        assert.deepEqual(user.toJSON(), fullInput);
        assert.isUndefined(user.validateSync());
    });

    it('has required fields', () => {
        const user = new User({});
        const errors = getErrors(user.validateSync(), 2);
        assert.strictEqual(errors.name.kind, 'required');
        assert.strictEqual(errors.hash.kind, 'required');
    });

    const input = {
        name: 'Journey'
    };

    const password = 'unicornsaregood';

    it('generates hash from password', () => {
        const user = new User(input);
        user.generateHash(password);
        assert.ok(user.hash);
        assert.notEqual(user.hash, user.password);
    });

    it('compares password to hash', () => {
        const user = new User(input);
        user.generateHash(password);
        assert.ok(user.comparePassword(password));
    });
});