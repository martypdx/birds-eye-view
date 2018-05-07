const router = require('express').Router();
const Item = require('../models/Item');
const ensureRole = require('../util/ensure-role');

module.exports = router
    .post('/', ensureRole('admin'), (req, res, next) => {
        Item.create(req.body)
            .then(item => res.json(item))
            .catch(next);
    });