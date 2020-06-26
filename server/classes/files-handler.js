const fs = require('fs');
const fsPromises = fs.promises;
const logger = require('../config/logger');
const path = require('path');
const _ = require('lodash');

const _basePathArchive = path.resolve(__dirname, '../archive');

/**
 *
 * @param  {Array} path
 * @param  {String} ext
 */
const buildPath = (paths, ext) => {
  logger.info(path.join(...paths) + (ext || ''));
  return path.join(...paths) + (ext || '');
};

/**
 *
 * @param {String} pathDir
 */
const createDirResponse = (pathDir) => {
  return fsPromises.mkdir(pathDir, {
    recursive: true,
  });
};

/**
 * Check if a file or dir exists
 * @param {String} path
 * @returns Boolean flag true if is a dir, otherwise false
 */
const checkExists = (path) => {
  return fs.existsSync(path);
};

/**
 *
 * @param {String} pathFile
 * @param {JSON} responseData
 */
const writeResponseFile = (pathFile, responseData) => {
  return fsPromises.writeFile(pathFile, JSON.stringify(responseData));
};

/**
 *
 * @param {String} pathDir
 * @param {String} fileName
 * @param {JSON} responseData
 */
const createResponseFile = async (pathDir, fileName, responseData) => {
  if (!checkExists(pathDir)) {
    logger.warn('Project dir response not found, creating again');
    await createDirResponse(pathDir);
  }

  await writeResponseFile(path.join(pathDir, fileName), responseData);
};

/**
 *
 * @param {String} path
 */
const loadResponseFile = async (path) => {
  if (checkExists(path)) {
    return JSON.parse(await fsPromises.readFile(path, { encoding: 'utf8' }));
  }
};

/**
 *
 * @param {String} pathDir
 */
const readFileFromDirectory = (pathDir) => {
  return fsPromises.readdir(pathDir);
};

/**
 *
 * @param {String} projectId
 * @param {String} requestId
 * @param {JSON} responseData
 */
const deleteFile = (filePath) => {
  return fsPromises.unlink(filePath);
};

/**
 *
 * @param {String} pathDir
 * @param {Array} fileNames
 */
const deleteManyFiles = (pathDir, fileNames) => {
  fileNames.forEach(async (fileName) => {
    await deleteFile(path.join(pathDir, fileName));
  });
};

/**
 *
 * @param {String} pathDir
 */
const deleteFilesFromDirectory = async (pathDir) => {
  let fileNames = await readFileFromDirectory(pathDir);
  deleteManyFiles(pathDir, fileNames);
};

/**
 *
 * @param {String} pathDir
 */
const removeDirectory = async (pathDir) => {
  await deleteFilesFromDirectory(pathDir);
  return fsPromises.rmdir(pathDir);
};

/**
 *
 * @param {String} hadFile
 * @param {String} hasFile
 * @param {String} pathDir
 * @param {String} fileName
 * @param {JSON} responseData
 */
const upsertFile = async (
  hadFile,
  hasFile,
  pathDir,
  fileName,
  responseData
) => {
  if (hasFile) {
    // create or rewrite file
    await createResponseFile(pathDir, fileName, responseData);
  } else if (hadFile) {
    await deleteFile(path.join(pathDir, fileName));
  }
};

module.exports = {
  buildPath,
  createResponseFile,
  createDirResponse,
  loadResponseFile,
  upsertFile,
  deleteFile,
  deleteManyFiles,
  removeDirectory,
  _basePathArchive,
};
