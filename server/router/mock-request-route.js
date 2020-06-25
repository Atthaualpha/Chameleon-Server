const express = require('express');
const router = express.Router();
const MockRequest = require('../classes/mock-request');
const { request } = require('express');

let mockRequest = new MockRequest();

router.get('/:id', (req, res) => {
  mockRequest.findRequest(req.params.id, (err, requestDoc) => {
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
    req.body,
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

router.put('/:id', (req, res) => {
  mockRequest.updateRequest(req.params.id, req.body, (err, requestDoc) => {
    if (err) {
      return res.status(500).json({
        completed: false,
        response: {
          message: 'Error updating the request',
        },
      });
    }

    if (!requestDoc) {
      res.json({
        completed: true,
        response: {
          updated: false,
          message: 'Request not found',
        },
      });
    } else {
      res.json({
        completed: true,
        response: {
          updated: true,
          message: 'Request updated',
        },
      });
    }
  });
});

router.delete('/:projectId', (req, res) => {
  mockRequest.deleteRequests(
    req.params.projectId,
    req.body,
    (err, deletedCount) => {
      if (err) {
        return res.status(500).json({
          completed: false,
          response: {
            message: 'Error deleting the request',
          },
        });
      }

      res.json({
        completed: true,
        response: {
          deletedCount,
          message: 'Request(s) deleted',
        },
      });
    }
  );
});

module.exports = router;
