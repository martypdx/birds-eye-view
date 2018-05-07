const express = require('express');
const app = express();
const morgan = require('morgan');
const errorHandler = require('./util/error-handler');
const ensureAuth = require('./util/ensure-auth')();

app.use(express.json());
app.use(morgan('dev'));

const auth = require('./routes/auth');
const squares = require('./routes/squares');
const items = require('./routes/items');
const endpoints = require('./routes/endpoints');
const levels = require('./routes/levels');
const hazards = require('./routes/hazards');
const users = require('./routes/users');

app.use('/api/auth', auth);
app.use('/api/squares', ensureAuth, squares);
app.use('/api/items', ensureAuth, items);
app.use('/api/endpoints', ensureAuth, endpoints);
app.use('/api/levels', ensureAuth, levels);
app.use('/api/hazards', ensureAuth, hazards);
app.use('/api/users', ensureAuth, users);

app.use(errorHandler());

module.exports = app;
