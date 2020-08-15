const Mocker = require('../classes/mocker');
const MockRequest = require('../classes/mock-request');
const logger = require('../config/logger');
const _ = require('lodash');

const findProjectId = (requestId) => {
  const mockRequest = new MockRequest();
  return new Promise((resolve, reject) => {
    mockRequest.findProjectIdByRequestId(requestId, (err, projectId) => {
      if (err) {
        return reject(err);
      }
      resolve(projectId);
    });
  });
};

const validateDuplicateRequest = async (
  requestId,
  projectId,
  request,
  callback
) => {
  try {
    if (requestId) {
      projectId = await findProjectId(requestId);
    }

    const mocker = new Mocker();
    const url = request.url.split('?')[0];    
    await mocker
      .findMockRequest(
        projectId,
        request.method,
        url,
        request.queryParams,
        request.headers
      ).toArray(async (err, result) => {
        if (err) {
          return callback(err);
        }
        let id;
        
        if (result.length > 0) {
          id = result[0]._id.toString();
          
          //validate when is updating the same request
          if (requestId && requestId !== id) {
            return callback(null, { count: 1, id });
          } else if (requestId) {
            return callback(null, { count: 0, id });
          }
        }

        callback(null, { count: result.length, id });
      });
  } catch (error) {
    callback(err);
  }
};

module.exports = {
  validateDuplicateRequest,
};
