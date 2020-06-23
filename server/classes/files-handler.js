const fs = require('fs');
const fsPromises = fs.promises;
const logger = require('../config/logger');
const path = require('path');

const _basePath = path.resolve(__dirname, '../archive');

/**
 * Build the path to a file or directory
 * @param  {...any} paths
 * @return String with the path of given arguments
 */
const buildPath = (...args) => {
  return path.join(...args);
};

/**
 *
 * @param {String} projectId
 */
const createDirResponse = (projectId) => {
  return fsPromises.mkdir(buildPath(_basePath, projectId), { recursive: true });
};

/**
 * Check if a file or dir exists
 * @param {String} projectId
 * @returns Boolean flag true if is a dir, otherwise false
 */
const checkExists = (path) => {
  return fs.existsSync(path);
};

/**
 *
 * @param {String} path
 * @param {String} requestId
 * @param {JSON} responseData
 */
const writeResponseFile = (projectId, requestId, responseData) => {
  const filePath = buildPath(_basePath, projectId, requestId) + '.json';
  return fsPromises.writeFile(filePath, JSON.stringify(responseData));
};

/**
 *
 * @param {String} projectId
 * @param {String} requestId
 * @param {JSON} responseData
 */
const createResponseFile = async (projectId, requestId, responseData) => {
  if (!checkExists(buildPath(_basePath, projectId))) {
    logger.warn('Project dir response not found, creating again');
    await createDirResponse(projectId);
  }

  await writeResponseFile(projectId, requestId, responseData);
};

/**
 * Load the response file and return its content
 * @param {String} projectId
 * @param {String} requestId
 */
const loadResponseFile = async (projectId, requestId) => {
  const filePath = buildPath(_basePath, projectId, requestId) + '.json';
  if (checkExists(filePath)) {
    return JSON.parse(
      await fsPromises.readFile(filePath, { encoding: 'utf8' })
    );
  }
};

module.exports = {
  createResponseFile,
  createDirResponse,
  loadResponseFile,
};
