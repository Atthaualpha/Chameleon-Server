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
    console.log(url)
    try {
      await this.findMockRequest(
        projectId,
        method,
        url,
        queryParams,
        headers
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

  findMockRequest(projectId, method, url, queryParams, headers) {
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

    return cnn
      .getDb()
      .collection(collection)
      .aggregate([
        {
          $match: {
            method: method,
            url: new RegExp(url, 'i'),
            projectId: new mongo.ObjectID(projectId),
          },
        },
        {
          $match: {
            $expr: {
              $ne: [
                {
                  $regexFindAll: {
                    input: {
                      $arrayElemAt: [
                        {
                          $split: ['$url', '?'],
                        },
                        0,
                      ],
                    },
                    regex: new RegExp(url, 'i'),
                  },
                },
                [],
              ],
            },
          },
        },
        {
          $match: {
            $and: [
              {
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
      ]);
  }
}

module.exports = Mocker;
