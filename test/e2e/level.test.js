const { assert } = require('chai');
const request = require('./request');
const { dropCollection, createAdminToken } = require('./db');


describe('Level API', () => {
    before(() => dropCollection('users'));
    before(() => dropCollection('levels'));
    before(() => dropCollection('squares'));

    let adminToken = '';
    before(() => createAdminToken().then(t => adminToken = t));

    




});