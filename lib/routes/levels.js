const router = require('express').Router();
const Level = require('../models/Level');

module.exports = router
    .post('/', (req, res, next) => {
        Level.create(req.body)
            .then(level => res.json(level))
            .catch(next);
    });