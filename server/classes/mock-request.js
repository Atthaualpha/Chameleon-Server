const cnn = require('../config/dbConfig');
const mongoClient = require('../config/dbConfig').getMongoClient();
const mongo = require('mongodb');
const logger = require('../config/logger');
const fileHandler = require('./files-handler');
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
        await fileHandler.createResponseFile(
          projectId,
          requestDoc.id.toString(),
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
          { projection: { name: 1, url: 1, status: 1, restMethod: 1 } }
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
      let { hasResponse, ...result } = await cnn
        .getDb()
        .collection(collection)
        .findOne({ _id: new mongo.ObjectID(requestId) });

      if (hasResponse) {
        responseBody = await fileHandler.loadResponseFile(
          result.projectId.toString(),
          requestId
        );
      }

      result.responseBody = responseBody;

      callback(null, result);
    } catch (err) {
      logger.error(err);
      callback(err);
    }
  }
}

module.exports = MockRequest;
