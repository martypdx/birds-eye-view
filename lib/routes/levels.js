const router = require('express').Router();
const Level = require('../models/Level');
const ensureRole = require('../util/ensure-role');

module.exports = router
    .post('/', ensureRole('admin'), (req, res, next) => {
        Level.create(req.body)
            .then(level => res.json(level))
            .catch(next);
    });