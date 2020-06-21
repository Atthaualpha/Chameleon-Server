const express = require('express');
const app = express();
const mockRouter = require('./mock-route');
const projectRouter = require('./project-route');

//routes, the order matters, mock router should be the last
app.use('/project', projectRouter);
app.use(mockRouter);

module.exports = app;
