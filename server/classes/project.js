const cnn = require('../config/dbConfig');
const mongo = require('mongodb');
const logger = require('../config/logger');
const fileHandler = require('./files-handler');

const collection = 'project';

class Project {
  #projectId;
  #name;

  /**
   * Create a new project
   * @param {String} name
   * @param {function} callback
   */
  async createProject(projectDoc, callback) {
    try {
      let response = await cnn
        .getDb()
        .collection(collection)
        .insertOne({ ...projectDoc, dateCreated: new Date() });

      let project = {
        id: response.insertedId,
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
        .collection(collection)
        .findOne({ _id: new mongo.ObjectID(projectId) });

      callback(null, project);
    } catch (err) {
      logger.error(err);
      callback(err);
    }
  }

  /**
   *
   * @param {String} name
   * @param {Function} callback
   */
  async findProjectsByName(name, callback) {
    try {
      let cursor;
      let projects = [];

      if (name) {
        cursor = await cnn
          .getDb()
          .collection(collection)
          .find({ name: { $regex: name, $options: 'i' } })
          .sort({ name: 1 });
      } else {
        cursor = cnn.getDb().collection(collection).find({}).sort({ name: 1 });
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

  /**
   *
   * @param {String} projectId
   * @param {JSON} projectDoc
   * @return The project updated
   */
  async updateProject(projectId, projectDoc, callback) {
    try {
      let result = await cnn
        .getDb()
        .collection(collection)
        .findOneAndUpdate(
          { _id: new mongo.ObjectID(projectId) },
          { $set: { name: projectDoc.name } },
          { returnOriginal: false }
        );

      callback(null, result.value);
    } catch (err) {
      logger.error(err);
      callback(err);
    }
  }

  /**
   *
   * @param {String} projectId
   * @param {Function} callback
   */
  async deleteProject(projectId, callback) {
    try {
      let result = await cnn
        .getDb()
        .collection(collection)
        .findOneAndDelete({ _id: new mongo.ObjectID(projectId) });

      callback(null, result.value);
    } catch (err) {
      logger.err(err);
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
