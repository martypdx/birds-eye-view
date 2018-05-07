const router = require('express').Router();
const User = require('../models/User');
const { updateOptions } = require('../util/mongoose-helpers');
const Level = require('../models/Level');

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
            .populate({
                path: 'inventory.item',
                select: 'itemName'
            })
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

    .delete('/:id/inventory', (req, res, next) => {
        const { id } = req.params;

        User.findByIdAndUpdate(
            id,
            { $set: { inventory: [] } },
            updateOptions
        )
            .then(() => {
                res.send({ cleared: true });
            })
            .catch(next);
    })

    .get('/:id/intro', (req, res, next) => {
        User.findById(req.params.id)
            .lean()
            .select('name')
            .populate({
                path: 'currentLevel',
                select: 'intro'
            })
            .populate({
                path: 'currentSquare',
                select: 'squareDesc'
            })
            .then(user => {
                res.json({ intro: `${user.currentLevel.intro.replace('(User Name)', user.name)} ${user.currentSquare.squareDesc}` });
            })
            .catch(next);
    })

    // .get('/:id/scene', (req, res, next) => {
    //     User.findById(req.params.id)
    //         .lean()
    //         .select('currentSquare')
    //         .populate({
    //             path: 'currentSquare',
    //             select: 'squareDesc'
    //         })
    //         .then(user => {
    //             res.json({ scene: user.currentSquare.squareDesc });
    //         })
    //         .catch(next);
    // })

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
    })
    
    .get('/:id/level', (req, res, next) => { // TODO
        User.getCurrentLevel(req.params.id)
            .then(levelNum => {
                res.json({ level: levelNum });
            })
            .catch(next);
    })

    .put('/:id/square', (req, res, next) => {
        const { id } = req.params;

        User.getCurrentLevel(id)
            .then(levelNum => {
                return Level.identifySquare(levelNum, req.body);
            })
            .then(level => {
                if(!level.length) {
                    res.json({ currentSquare: null });
                } else {
                    const newStatus = { currentSquare: level[0].square._id };
                    return User.findByIdAndUpdate(id, newStatus, updateOptions);
                }
            })
            .then(user => res.json(user))
            .catch(next);
    })

    .put('/:id/level', (req, res, next) => {
        const { id } = req.params;

        Level.findOne(req.body)
            .then(level => {
                if(!level) {
                    res.json({ currentLevel: null });
                } else {
                    const newLevel = { currentLevel: level._id };
                    return User.findByIdAndUpdate(id, newLevel, updateOptions);
                }
            })
            .then(user => res.json(user))
            .catch(next);
    });