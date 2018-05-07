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
    
    .get('/:id/inventory/:itemId', (req, res, next) => {
        const { id, itemId } = req.params;

        User.findOne({ _id: id }, { 'inventory.item': itemId })
            .lean()
            .select('inventory')
            .populate({
                path: 'inventory.item',
                select: 'itemName'
            })
            .then(user => {
                user.inventory.length ? res.send(user.inventory[0].item) : res.send({ itemName: null });
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

    .get('/:id/position', (req, res, next) => {
        User.findById(req.params.id)
            .lean()
            .select('currentSquare')
            .populate({
                path: 'currentSquare',
                select: 'coords'
            })
            .then(user => {
                res.json(user.currentSquare);
            })
            .catch(next);
    })
    
    .get('/:id/square', (req, res, next) => {
        User.findById(req.params.id)
            .lean()
            .select('currentSquare')
            .then(({ currentSquare }) => {
                res.json({ currentSquare: currentSquare });
            })
            .catch(next);
    })

    .get('/:id/level', (req, res, next) => {
        User.getCurrentLevel(req.params.id)
            .then(levelNum => {
                res.json({ level: levelNum });
            })
            .catch(next);
    })

    .put('/:id/square', (req, res, next) => {
        const { id } = req.params;
        const { coords, squareId }  = req.body;

        User.getCurrentLevel(id)
            .then(levelNum => {
                return Level.identifySquare(levelNum, coords);
            })
            .then(level => {
                if(!level.length) {
                    res.json({ currentSquare: null });
                } else {
                    return User.findByIdAndUpdate(id, {
                        $set: { currentSquare: level[0].square._id },
                        $addToSet: { visitedSquares: { squareId: squareId } }
                    }, updateOptions);
                }
            })
            .then(user => res.json(user))
            .catch(next);
    })

    .get('/:id/visited/:squareId', (req, res, next) => {
        const { id, squareId } = req.params;

        User.findOne({ _id: id, 'visitedSquares.squareId': squareId })
            .lean()
            .select('visitedSquares')
            .then(user => {
                user ? res.send({ visited: true }) : res.send({ visited: false });
            })
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
    })

    .delete('/:id/visited', (req, res, next) => {
        const { id } = req.params;

        User.findByIdAndUpdate(
            id,
            { $set: { visitedSquares: [] } },
            updateOptions
        )
            .then(() => {
                res.send({ cleared: true });
            })
            .catch(next);
    })

    .post('/:id/game', (req, res, next) => {
        User.findById(req.params.id)
            .then(user => {
                return user.assignStart();
            })
            .then(user => user.save())
            .then(user => res.json(user))
            .catch(next);
    });