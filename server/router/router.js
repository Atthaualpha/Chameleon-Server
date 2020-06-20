const app = require('express')();

app.get(/\w+\/.+/, (req, res) => {
    res.send('hola');
});

module.exports = app;