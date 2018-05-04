const router = require('express').Router();
const User = require('../models/User');
const { updateOptions } = require('../util/mongoose-helpers');

module.exports = router
    .post('/:id/inventory', (req, res, next) => {
        const { body } = req;

        User.findByIdAndUpdate(
            req.params.id,
            { $set: { inventory: [body.type] } },
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
    
    .delete('/:id/inventory', (req, res, next) => {
        User.findByIdAndUpdate(
            req.params.id,
            { $pop: { inventory: 1 } },
            updateOptions
        )
            .then(user => {
                res.send({ inventory: user.inventory });
            })
            .catch(next);
    })
    
    .get('/:id/square', (req, res, next) => {
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
    });