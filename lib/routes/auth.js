const router = require('express').Router();
const User = require('../models/User');
const { sign } = require('../util/token-service');
const ensureAuth = require('../util/ensure-auth')();

module.exports = router
    .get('/verify', ensureAuth, (req, res) => {
        res.json({ verified: true });
    })

    .post('/signup', (req, res, next) => {
        const { body } = req;
        const { name, password, roles } = body;
        delete body.password;

        User.find({ name })
            .count()
            .then(count => {
                if(count) throw {
                    status: 400,
                    error: 'This name is already taken'
                };
                const user = new User({ name, roles });
                user.generateHash(password);
                return user.startLocal();
            })
            .then(user => user.save())
            .then(user => {
                res.json({ token: sign(user), userId: user._id, name: user.name });
            })
            .catch(next);
    })
    
    .post('/signin', (req, res, next) => {
        const { body } = req;
        const { name, password } = body;
        delete body.password;

        User.findOne({ name })
            .then(user => {
                if(!user || !user.comparePassword(password)) throw {
                    status: 401,
                    error: 'Invalid Username or Password'
                };
                res.json({ token: sign(user), userId: user._id, name: user.name });
            })
            .catch(next);
    });