const connect = require('../../lib/util/connect');
const mongoose = require('mongoose');
const request = require('./request');

before(() => connect('mongodb://localhost:27017/bird-game-test'));
after(() => mongoose.connection.close());

module.exports = {
    dropCollection(name) {
        return mongoose.connection.dropCollection(name)
            .catch(err => {
                if(err.codeName !== 'NamespaceNotFound') throw err;
            });
    },

    createAdminToken(info = { name: 'Administrator', password: '12345', roles: ['admin'] }) {
        return request.post('/api/auth/signup')
            .send(info)
            .then(({ body }) => body.token);
    },

    postData(path, data, adminToken) {
        return request.post(path)
            .set('Authorization', adminToken)
            .send(data)
            .then(({ body }) => body);
    }
};