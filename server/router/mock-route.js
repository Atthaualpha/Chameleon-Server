const express = require('express');
const router = express.Router();
const Mocker = require('../classes/mocker');
const project = require('../validators/project');
const { response } = require('express');
let mocker = new Mocker();

//handle any route that match the given regex
router.all(/mocker\/\w+\/.+/, (req, res) => {
  const path = req.path.replace('/mocker/', '');
  const projectId = path.substring(0, path.indexOf('/'));
  const url = path.substring(path.indexOf('/') + 1);
  mocker.createMockResponse(
    projectId,
    req.method,
    url,
    req.query,
    req.headers,
    (err, result) => {
      if (err) {
        return res.status(404).json({
          response: {
            message: err
          }
        });
      }

      result.responseHeaders.forEach(header => {
          res.setHeader(header.key, header.value)
      });
      res.status(result.status).json(result.responseBody);
    }
  );
});

//handle any route when regex path does not match
router.all('*', (req, res) => {
  res.send(
    'route not found, path should have following structure [host]/mocker/[proyectid]/[requesturl]'
  );
});

module.exports = router;
