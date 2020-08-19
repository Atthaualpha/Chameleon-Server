const cnn = require('../config/dbConfig');
const mongo = require('mongodb');
const logger = require('../config/logger');
const fh = require('./files-handler');
const _ = require('lodash');

const collection = 'request';

class Mocker {
  async createMockResponse(
    projectId,
    method,
    url,
    queryParams,
    headers,
    callback
  ) {
    try {
      await this.findMockRequest(
        projectId,
        method,
        url,
        queryParams,
        headers,
        false
      ).toArray(async (err, result) => {
        if (err) {
          logger.error(err);
          return callback(err);
        }

        if (!result || _.isEmpty(result)) {
          return callback('Mock not found');
        }
        const requestMock = result[0];        
        let response = {
          status: requestMock.status,
          responseHeaders: requestMock.responseHeaders,
        };

        let responseBody = {};
        if (requestMock.hasResponse) {
          responseBody = await fh.loadResponseFile(
            fh.buildPath(
              [fh._basePathArchive, projectId, requestMock._id.toString()],
              '.json'
            )
          );
        }
        response.responseBody = responseBody;

        callback(null, response);
      });
    } catch (err) {
      logger.error(err);
      callback(err);
    }
  }

  buildQueryParams(queryParams) {
    let queryKeys;
    let queries;
    if (_.isArray(queryParams)) {
      queryKeys = queryParams.map((query) => {
        return query.key;
      });
      queries = queryParams;
    } else {
      queryKeys = Object.keys(queryParams);
      queries = Object.entries(queryParams).map(([key, value]) => {
        return { key, value };
      });
    }
    return { queryKeys, queries };
  }

  buildHeaders(headerParams) {
    let headers;
    if (!_.isArray(headerParams)) {
      headers = Object.entries(headerParams).map(([key, value]) => {
        return { key, value };
      });
    } else {
      headers = headerParams;
    }
    return headers;
  }

  findMockRequest(
    projectId,
    method,
    url,
    queryParams,
    headersParams,
    validateDuplicate
  ) {
    let { queryKeys, queries } = this.buildQueryParams(queryParams);
    const headers = this.buildHeaders(headersParams);
    let query = null;
    if (validateDuplicate) {
      query = this.duplicateMockRequestQuery(
        projectId,
        method,
        url,
        queries,
        headers
      );
    } else {
      query = this.findMockRequestQuery(
        projectId,
        method,
        url,
        queryKeys,
        queries,
        headers
      );
    }
    return cnn.getDb().collection(collection).aggregate(query);
  }

  findMockRequestQuery(projectId, method, url, queryKeys, queries, headers) {
    return [
      {
        $match: {
          method: method,
          $expr: {
            $eq: [{ $arrayElemAt: [{ $split: ['$url', '?'] }, 0] }, url],
          },
          projectId: new mongo.ObjectID(projectId),
        },
      },
      {
        $match: {
          $or: [
            {
              $and: [
                {
                  exactQuery: true,
                },
                {
                  $expr: {
                    $setEquals: ['$queryParams', queries],
                  },
                },
              ],
            },
            {
              $and: [
                {
                  exactQuery: false,
                },
                {
                  $expr: {
                    $setEquals: ['$queryParams.key', queryKeys],
                  },
                },
              ],
            },
          ],
        },
      },
      {
        $project: {
          url: 1,
          status: 1,
          responseHeaders: 1,
          hasResponse: 1,
          exactHeaders: 1,
          headers: 1,
          headersTemp: {
            $filter: {
              input: headers,
              as: 'header',
              cond: {
                $in: ['$$header.key', '$headers.key'],
              },
            },
          },
        },
      },
      {
        $match: {
          $or: [
            {
              $and: [
                {
                  exactHeaders: true,
                },
                {
                  $expr: {
                    $setEquals: ['$headers', '$headersTemp'],
                  },
                },
              ],
            },
            {
              $and: [
                {
                  exactHeaders: false,
                },
                {
                  $expr: {
                    $setEquals: ['$headers.key', '$headersTemp.key'],
                  },
                },
              ],
            },
          ],
        },
      },
      {
        $project: {
          url: 1,
          status: 1,
          responseHeaders: 1,
          hasResponse: 1,
        },
      },
    ];
  }

  duplicateMockRequestQuery(projectId, method, url, queries, headers) {
    return [
      {
        $match: {
          method: method,
          $expr: {
            $eq: [{ $arrayElemAt: [{ $split: ['$url', '?'] }, 0] }, url],
          },
          projectId: new mongo.ObjectID(projectId),
        },
      },
      {
        $match: {
          $expr: {
            $setEquals: ['$queryParams', queries],
          },
        },
      },
      {
        $project: {
          url: 1,
          status: 1,
          responseHeaders: 1,
          hasResponse: 1,
          exactHeaders: 1,
          headers: 1,
          headersTemp: {
            $filter: {
              input: headers,
              as: 'header',
              cond: {
                $in: ['$$header.key', '$headers.key'],
              },
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $setEquals: ['$headers', '$headersTemp'],
          },
        },
      },
      {
        $project: {
          url: 1,
          status: 1,
          responseHeaders: 1,
          hasResponse: 1,
        },
      },
    ];
  }
}

module.exports = Mocker;
