const cnn = require('../config/dbConfig');
const mongo = require('mongodb');
const logger = require('../config/logger');
const fileHandler = require('./files-handler');

class Project {
  #projectId;
  #name;

  /**
   * Create a new project
   * @param {String} name
   * @param {function} callback
   */
  async createProject(name, callback) {
    try {
      let response = await cnn
        .getDb()
        .collection('project')
        .insertOne({ name, dateCreated: new Date() });

      let project = {
        id: response.insertedId,
        name,
      };

      fileHandler
        .createDirResponse(project.id.toString())
        .catch(() => logger.warn('Error creating project Dir'));

      callback(null, project);
    } catch (err) {
      logger.error(err);
      callback(err);
    }
  }

  /**
   * Find a project by id
   * @param {String} projectId
   */
  async findProject(projectId, callback) {
    try {
      let project = await cnn
        .getDb()
        .collection('project')
        .findOne({ _id: new mongo.ObjectID(projectId) });

      callback(null, project);
    } catch (err) {
      logger.error(err);
      callback(err);
    }
  }

  async findProjectsByName(name, callback) {
    try {
      let cursor;
      let projects = [];

      if (name) {
        cursor = cnn
          .getDb()
          .collection('project')
          .find({ name: { $regex: name, $options: 'i' } })
          .sort({ name: 1 });
      } else {
        cursor = cnn.getDb().collection('project').find({}).sort({ name: 1 });
      }

      await cursor.forEach((doc) => {
        let project = {
          id: doc._id,
          name: doc.name,
          dateCreated: doc.dateCreated,
        };
        projects.push(project);
      });

      let response = {
        projects,
        count: await cursor.count(),
      };

      callback(null, response);
    } catch (err) {
      logger.error(err);
      callback(err);
    }
  }

  get projectId() {
    return this.#projectId;
  }

  /**
   *  @param {String} projectId
   */
  set projectId(projectId) {
    this.#projectId = projectId;
  }

  /**
   * @param {String} name
   */
  set name(name) {
    this.#name = name;
  }

  get name() {
    return this.#name;
  }
}

module.exports = Project;
