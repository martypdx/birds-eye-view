const router = require('express').Router();
const Hazard = require('../models/Hazard');

module.exports = router
    .post('/', (req, res, next) => {
        Hazard.create(req.body)
            .then(hazard => res.json(hazard))
            .catch(next);
    });