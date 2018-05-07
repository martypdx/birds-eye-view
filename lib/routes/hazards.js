const router = require('express').Router();
const Hazard = require('../models/Hazard');
const ensureRole = require('../util/ensure-role');

module.exports = router
    .post('/', ensureRole('admin'), (req, res, next) => {
        Hazard.create(req.body)
            .then(hazard => res.json(hazard))
            .catch(next);
    })

    .get('/', (req, res, next) => {
        Hazard.aggregate([
            { $sample: { size: 1 } },
            { $project: { _id: 1, hazardStory: 1 } }
        ])
            .then(hazard => res.json(hazard[0]))
            .catch(next);
    });