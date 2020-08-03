const validator = require('../validators/project');
const logger = require('../config/logger');

const validateProjectCreation = (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).json({
      completed: false,
      response: {
        message: 'Project name is required',
      },
    });
  }

  validator.validateProjectDuplicated(req.body.name, (err, project) => {
    if (err) {
      logger.error(err);
      next('Error verifying project');
    }

    if (project) {
      return res.status(400).json({
        completed: false,
        response: {
          message: 'Project name already exists',
        },
      });
    }

    next();
  });
};

module.exports = {
  validateProjectCreation,
};
