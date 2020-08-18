const express = require('express');
const router = express.Router();
const Reports = require('../classes/reports');

const reports = new Reports();

router.get('/requestByProject', (req, res) => {
  reports.findRequestByProjects((err, result) => {
    if (err) {
      return res.status(500).json({
        completed: false,
        response: {
          message: 'Error loading report',
        },
      });
    }
    res.json({
      completed: true,
      response: result,
    });
  });
});

module.exports = router
