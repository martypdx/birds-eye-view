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
    })

    .get('/:id/level', (req, res, next) => {
        User.findById(req.params.id)
            .lean()
            .select('currentTask')
            .populate({
                path: 'currentTask',
                select: 'number'
            })
            .then(user => {
                const level = user.currentTask.number;
                res.json({ level: level });
            })
            .catch(next);
    })

    .put('/:id/level', (req, res, next) => {
        User.findById(req.params.id)
            .then(user => {
                return user.assignTask(req.body.level);
            })
            .then(user => user.save())
            .then(user => res.json(user))
            .catch(next);
    })

    .get('/:id/options/:direction', (req, res, next) => {
        const { id, direction } = req.params;
        
        let response = {};
    
        User.findById(id)
            .lean()
            .select(`options.${direction}`)
            .then(user => {
                const move = user.options[direction];
                response.move = move;
                return move === 'look' ? populateFluff(id, direction) : populateTask(id, action);
            })
            .then(info => {
                response.info = info;
                res.json(response);
            })
            .catch(next);
    });

function populateFluff(id, direction) {
    return User.findById(id)
        .lean()
        .select(`options.${direction}.action`)
        .populate(`options.${direction}.fluff`)
        .then(user => {
            return user.options[direction].fluff.desc;
        });
}

function populateTask(id, action) {
    return User.findById(id)
        .lean()
        .select('currentLevel')
        .populate('currentLevel')
        .then(user => {
            if(move === 'n') {
                return ;
            } else {
                user.currentTask.endpoint.requiredItem = user.currentTask.requiredItem.type;
                return user.currentTask.endpoint;
            }
        });
}