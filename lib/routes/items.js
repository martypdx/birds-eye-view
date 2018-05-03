const router = require('express').Router();
const Item = require('../models/Item');

module.exports = router
    .post('/', (req, res, next) => {
        Item.create(req.body)
            .then(item => res.json(item))
            .catch(next);
    });