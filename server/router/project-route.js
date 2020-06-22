const express = require('express');
const router = express.Router();
const Project = require('../classes/project');

let project = new Project();

router.get('/:id', (req, res) => {
  project.findProject(req.params.id, (err, projectFound) => {
    if (err) {
      return res.status(500).json({
        completed: false,
        response: {
          message: 'Error while searching project',
        },
      });
    }

    if (!projectFound) {
      return res.json({
        completed: true,
        response: {
          message: 'Project not found',
        },
      });
    } else {
      res.json({
        completed: true,
        response: projectFound,
      });
    }
  });
});

router.get('/', (req, res) => {
  project.findProjectsByName(req.query.name, (err, projects) => {
    if (err) {
      return res.status(500).json({
        completed: false,
        response: {
          message: 'Error while searching projects',
        },
      });
    } else {
      res.json({
        completed: true,
        response: projects,
      });
    }
  });
});

router.post('/', (req, res) => {
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
      response: projectCreated,
    });
  });
});

module.exports = router;
