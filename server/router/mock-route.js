const express = require('express');
const router = express.Router();

//handle any route that match the given regex
router.all(/mocker\/\w+\/.+/, (req, res) => {
  res.send('hola');
});

//handle any route when regex path does not match
router.all('*', (req, res) => {
  res.send(
    'route not found, path should have following structure [host]/mocker/[proyectname]/[requesturl]'
  );
});

module.exports = router;
