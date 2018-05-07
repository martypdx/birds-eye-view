const router = require('express').Router();
const Endpoint = require('../models/Endpoint');
const ensureRole = require('../util/ensure-role');

module.exports = router
    .post('/', ensureRole('admin'), (req, res, next) => {
        Endpoint.create(req.body)
            .then(endpoint => res.json(endpoint))
            .catch(next);
    });