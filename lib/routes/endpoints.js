const router = require('express').Router();
const Endpoint = require('../models/Endpoint');

module.exports = router
    .post('/', (req, res, next) => {
        Endpoint.create(req.body)
            .then(endpoint => res.json(endpoint))
            .catch(next);
    });