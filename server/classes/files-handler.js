const fs = require('fs');
const fsPromises = fs.promises;
const logger = require('../config/logger');
const path = require('path');

const _basePath = path.resolve(__dirname, '../archive');

/**
 *
 * @param {String} projectId
 */
const createDirResponse = (projectId) => {
  return fsPromises.mkdir(_basePath + '/' + projectId, { recursive: true });
};

/**
 *
 * @param {String} projectId
 * @returns Boolean flag true if is a dir, otherwise false
 */
const checkDirExists = (projectId) => {
  return fs.existsSync(_basePath + '/' + projectId);
};

/**
 *
 * @param {String} path
 * @param {String} requestId
 * @param {JSON} responseData
 */
const writeResponseFile = (projectId, requestId, responseData) => {
  let filePath = _basePath + '/' + projectId + '/' + requestId + '.json';

  return fsPromises.writeFile(filePath, JSON.stringify(responseData));
};

/**
 *
 * @param {String} projectId
 * @param {String} requestId
 * @param {JSON} responseData
 */
const createResponseFile = async (projectId, requestId, responseData) => {
  if (!checkDirExists(projectId)) {
    logger.warn('Project dir response not found, creating again');
    await createDirResponse(projectId);
  }

  await writeResponseFile(projectId, requestId, responseData);
};

module.exports = {
  createResponseFile,
  createDirResponse,
};
