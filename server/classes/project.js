const cnn = require('../config/dbConfig').getConnection();
const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectID;
const logger = require('../config/logger');

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
      let response = await cnn.collection('project').insertOne({ name });

      let project = {
        id: response.insertedId,
        name,
      };

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
        .collection('project')
        .findOne({ _id: new ObjectId(projectId) });

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
          .collection('project')
          .find({ name: { $regex: name, $options: 'i' } })
          .sort({ name: 1 });
      } else {
        cursor = cnn.collection('project').find({}).sort({ name: 1 });
      }

      await cursor.forEach((doc) => {
        let project = {
          id: doc._id,
          name: doc.name,
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
