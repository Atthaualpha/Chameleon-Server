const express = require('express');
const router = express.Router();
const MockRequest = require('../classes/mock-request');

let mockRequest = new MockRequest();

router.get('/:requestId', (req, res) => {
  mockRequest.findRequest(req.params.requestId, (err, requestDoc) => {
    if (err) {
      return res.status(500).json({
        completed: false,
        response: {
          message: 'Error while searching the request',
        },
      });
    }

    res.json({
      completed: true,
      response: requestDoc,
    });
  });
});

router.get('/all/:projectId', (req, res) => {
  mockRequest.findAllRequest(req.params.projectId, (err, requestDocs) => {
    if (err) {
      return res.status(500).json({
        completed: false,
        response: {
          message: 'Error while searching requests',
        },
      });
    }

    res.json({
      completed: true,
      response: requestDocs,
    });
  });
});

router.post('/:projectId', (req, res) => {
  mockRequest.createRequest(
    req.params.projectId,
    req.body.mockRequest,
    (err, requestDoc) => {
      if (err) {
        return res.status(500).json({
          completed: false,
          response: {
            message: 'Error creating the mock request',
          },
        });
      }

      res.json({
        completed: true,
        response: requestDoc,
      });
    }
  );
});

module.exports = router;
