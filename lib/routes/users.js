const router = require('express').Router();
const User = require('../models/User');
const { updateOptions } = require('../util/mongoose-helpers');

module.exports = router
    .post('/:id/inventory', (req, res, next) => {
        User.findByIdAndUpdate(
            req.params.id,
            { $push: { inventory: req.body } },
            updateOptions
        )
            .then(user => {
                res.send({ inventory: user.inventory });
            })
            .catch(next);
    })
    
    .get('/:id/inventory', (req, res, next) => {
        User.findById(req.params.id)
            .lean()
            .select('inventory')
            .then(user => {
                res.send({ inventory: user.inventory });
            })
            .catch(next);
    })
    
    .delete('/:id/inventory/:itemId', (req, res, next) => {
        const { id, itemId } = req.params;

        User.findByIdAndUpdate(
            id,
            { $pull: { inventory: { item: itemId } } },
            updateOptions
        )
            .then(() => {
                res.send({ removed: { item: itemId } });
            })
            .catch(next);
    })

    
    .get('/:id/intro', (req, res, next) => {
        User.findById(req.params.id)
            .lean()
            .select('currentSquare')
            .populate({
                path: 'currentSquare',
                select: 'squareDesc'
            })
            .then(user => {
                res.json({ intro: user.currentSquare.squareDesc });
            })
            .catch(next);
    })

    .get('/:id/coords', (req, res, next) => {
        User.findById(req.params.id)
            .lean()
            .select('currentSquare')
            .populate({
                path: 'currentSquare',
                select: 'coords'
            })
            .then(user => {
                res.json(user.currentSquare.coords);
            })
            .catch(next);
    });