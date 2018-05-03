const express = require('express');
const app = express();
const morgan = require('morgan');
const errorHandler = require('./util/error-handler');
const ensureAuth = require('./util/ensure-auth')();
const ensureRole = require('./util/ensure-role');

app.use(express.json());
app.use(morgan('dev'));

const auth = require('./routes/auth');
const squares = require('./routes/squares');
const items = require('./routes/items');
const endpoints = require('./routes/endpoints');
const levels = require('./routes/levels');
const users = require('./routes/users');

app.use('/api/auth', auth);
app.use('/api/squares', ensureAuth, ensureRole('admin'), squares);
app.use('/api/items', ensureAuth, ensureRole('admin'), items);
app.use('/api/endpoints', ensureAuth, ensureRole('admin'), endpoints);
app.use('/api/levels', ensureAuth, ensureRole('admin'), levels);
app.use('/api/users', ensureAuth, users);

app.use(errorHandler());

module.exports = app;
