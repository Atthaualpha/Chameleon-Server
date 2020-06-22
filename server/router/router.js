const express = require('express');
const app = express();
const mockRouter = require('./mock-route');
const projectRouter = require('./project-route');
const requestRouter = require('./mock-request-route');

//routes, the order matters, mock router should be the last
app.use('/project', projectRouter);
app.use('/mock-request', requestRouter);
app.use(mockRouter);

module.exports = app;
