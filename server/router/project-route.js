const express = require('express');
const router = express.Router();
const Project = require('../classes/project');

router.get('/', (req, res) => {
  res.send('TODO');
});

router.post('/', (req, res) => {
  let project = new Project();

  project.createProject(req.body.name, (err, projectCreated) => {
    if (err) {
      return res.status(500).json({
        completed: false,
        response: {
          message: 'Error creating the project',
        },
      });
    }

    res.json({
      completed: true,
      response: {
        projectCreated,
      },
    });
  });
});

module.exports = router;
