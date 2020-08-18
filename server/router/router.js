const express = require('express');
const app = express();
const mockRouter = require('./mock-route');
const projectRouter = require('./project-route');
const requestRouter = require('./mock-request-route');
const reportRouter = require('./reports');

//routes, the order matters, mock router should be the last

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use('/project', projectRouter);
app.use('/mock-request', requestRouter);
app.use('/reports', reportRouter);
app.use(mockRouter);

module.exports = app;
