const router = require('express').Router();
const Square = require('../models/Square');
const ensureRole = require('../util/ensure-role');

module.exports = router
    .post('/', ensureRole('admin'), (req, res, next) => {
        Square.create(req.body)
            .then(square => res.json(square))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        Square.findById(req.params.id)
            .lean()
            .select('squareDesc visitedDesc')
            .populate({
                path: 'itemHere',
                select: 'itemName itemStory'
            })
            .populate({
                path: 'endpointHere',
                select: 'endpointStory',
                populate: {
                    path: 'requiredItem',
                    select: 'itemName'
                }
            })
            .then(square => res.json(square))
            .catch(next);
    });