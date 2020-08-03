const cnn = require('../config/dbConfig');
const logger = require('../config/logger');

const collection = 'project';

const validateProjectDuplicated = (name, callback) => {
  cnn
    .getDb()
    .collection(collection)
    .findOne({ name: name })
    .then((project) => callback(null, project))
    .catch((err) => callback(err));
};

module.exports = {
  validateProjectDuplicated,
};
