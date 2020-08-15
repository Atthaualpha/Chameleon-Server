const validator = require('../validators/mock-request');
const logger = require('../config/logger');

const validateRequestGeneric = (err, result, res, next) => {
  if (err) {
    logger.error(err);
    next('Error verifying mock request');
  }

  if (result.count > 0) {
    return res.status(400).json({
      completed: false,
      response: {
        requestIdDuplicated: result.id,
        message:
          'Request with same url, query params and headers already exists',
      },
    });
  }
  next();
};

const validateRequestCreation = (req, res, next) => {
  validator.validateDuplicateRequest(
    null,
    req.params.projectId,
    req.body,
    (err, result) => {
      validateRequestGeneric(err, result, res, next);
    }
  );
};

const validateRequestUpdate = (req, res, next) => {
  validator.validateDuplicateRequest(
    req.params.id,
    null,
    req.body,
    (err, result) => {
      validateRequestGeneric(err, result, res, next);
    }
  );
};

module.exports = {
  validateRequestCreation,
  validateRequestUpdate,
};
