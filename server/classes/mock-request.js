const cnn = require('../config/dbConfig');
const mongoClient = require('../config/dbConfig').getMongoClient();
const mongo = require('mongodb');
const logger = require('../config/logger');
const fh = require('./files-handler');
const _ = require('lodash');

const collection = 'request';

class MockRequest {
  /**
   *
   * @param {String} projectId
   * @param {JSON} request
   * @param {Function} callback
   * @returns id of new request
   */
  async createRequest(projectId, requestMock, callback) {
    const session = mongoClient.startSession();
    try {
      session.startTransaction();

      let hasResponse = false;
      let { responseBody, ...remainRequest } = requestMock;
      if (!_.isEmpty(responseBody)) {
        hasResponse = true;
      }

      remainRequest.hasResponse = hasResponse;
      remainRequest.dateCreated = new Date();
      remainRequest.projectId = new mongo.ObjectID(projectId);
      let result = await cnn
        .getDb()
        .collection(collection)
        .insertOne(remainRequest, { session });

      let requestDoc = {
        id: result.insertedId,
      };

      if (hasResponse) {
        await fh.createResponseFile(
          fh.buildPath([fh._basePathArchive, projectId]),
          fh.buildPath([requestDoc.id.toString()], '.json'),
          responseBody
        );
      }

      callback(null, requestDoc);
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      logger.error(err);
      callback(err);
    } finally {
      session.endSession();
    }
  }

  /**
   *
   * @param {String} projectId
   * @param {Function} callback
   * @returns requests found, also cotains the count of documents found, empty when not found any
   */
  async findAllRequest(projectId, callback) {
    let requestMocks = [];

    try {
      let cursor = await cnn
        .getDb()
        .collection(collection)
        .find(
          { projectId: new mongo.ObjectID(projectId) },
          { projection: { name: 1, url: 1, status: 1, method: 1 } }
        );

      await cursor.forEach((doc) => {
        requestMocks.push(doc);
      });

      let response = {
        requestMocks,
        count: await cursor.count(),
      };

      callback(null, response);
    } catch (err) {
      logger.error(err);
      callback(err);
    }
  }

  /**
   * Find a single request by request identity
   * @param {String} requestId
   * @returns request found, undefined when not exists
   */
  async findRequest(requestId, callback) {
    let responseBody;
    try {
      let result = await cnn
        .getDb()
        .collection(collection)
        .findOne({ _id: new mongo.ObjectID(requestId) });

      if (result) {
        if (result.hasResponse) {
          responseBody = await fh.loadResponseFile(
            fh.buildPath(
              [fh._basePathArchive, result.projectId.toString(), requestId],
              '.json'
            )
          );
        }
        result.responseBody = responseBody;
      }

      callback(null, result);
    } catch (err) {
      logger.error(err);
      callback(err);
    }
  }

  /**
   *
   * @param {String} requestId
   * @param {JSON} requestDoc
   * @param {Function} callback
   */
  async updateRequest(requestId, requestMock, callback) {
    const session = mongoClient.startSession();
    try {
      session.startTransaction();
      let hasResponse = false;
      let { responseBody, _id, projectId, ...remainRequest } = requestMock;
      if (!_.isEmpty(responseBody)) {
        hasResponse = true;
      }

      remainRequest.hasResponse = hasResponse;
      let { value: result } = await cnn
        .getDb()
        .collection(collection)
        .findOneAndUpdate(
          { _id: new mongo.ObjectID(requestId) },
          { $set: { ...remainRequest } },
          { session, returnOriginal: true }
        );

      await fh.upsertFile(
        result.hasResponse,
        hasResponse,
        fh.buildPath([fh._basePathArchive, result.projectId.toString()]),
        fh.buildPath([requestId], '.json'),
        responseBody
      );

      callback(null, result);
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      logger.error(err);
      callback(err);
    } finally {
      session.endSession();
    }
  }

  /**
   * Delete one or many request
   * @param {Array} requestsIds
   * @param {Function} callback
   */
  async deleteRequests(projectId, requestsIds, callback) {
    if (_.isEmpty(requestsIds)) {
      return callback(null, 0);
    }

    const session = mongoClient.startSession();

    try {
      session.startTransaction();

      let dbRequestIds = requestsIds.map((req) => {
        return new mongo.ObjectID(req);
      });

      let { deletedCount } = await cnn
        .getDb()
        .collection(collection)
        .deleteMany({ _id: { $in: dbRequestIds } });

      fh.deleteManyFiles(
        fh.buildPath([fh._basePathArchive, projectId]),
        requestsIds.map((req) => req + '.json')
      );

      callback(null, deletedCount);
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      logger.error(err);
      callback(err);
    } finally {
      session.endSession();
    }
  }
}

module.exports = MockRequest;
