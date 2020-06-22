const cnn = require('../config/dbConfig').getConnection();
const mongoDB = require('mongodb');
const ObjectId = mongoDB.ObjectID;
const logger = require('../config/logger');

const collection = 'request';

class MockRequest {
  #id;
  #url;
  #queryParams;
  #requestBody;
  #requestHeaders;
  #responseBody;
  #responseHeaders;
  #projectId;
  #status;
  #restMethod;

  /**
   *
   * @param {String} projectId
   * @param {JSON} request
   * @param {Function} callback
   * @returns id of new request
   */
  async createRequest(projectId, requestMock, callback) {
    try {
      requestMock.projectId = new ObjectId(projectId);
      let result = await cnn.collection(collection).insertOne(requestMock);

      let requestDoc = {
        id: result.insertedId,
      };

      callback(null, requestDoc);
    } catch (err) {
      logger.error(err);
      callback(err);
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
        .collection(collection)
        .find({ projectId: new ObjectId(projectId) });

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
    try {
      let result = await cnn
        .collection(collection)
        .findOne({ _id: new ObjectId(requestId) });

      callback(null, result);
    } catch (err) {
      logger.error(err);
      callback(err);
    }
  }
}

module.exports = MockRequest;
