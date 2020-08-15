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
    const queryKeys = Object.keys(queryParams);
    const queries = Object.entries(queryParams).map(([key, value]) => {
      return { key, value };
    });
    await cnn
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
              {
                $or: [
                  {
                    $and: [
                      {
                        exactHeaders: true,
                      },
                      {
                        $expr: {
                          $setEquals: ['$headers', []],
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
                          $setEquals: ['$headers.key', []],
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
      ])
      .toArray(async (err, result) => {
        if (err) {
          return callback(err);
        }

        if (!result || _.isEmpty(result)) {
          return callback('Mock not found');
        }
        const requestMock = result[0];
        console.log(requestMock)
        let response = {
          status: requestMock.status,
          responseHeaders: requestMock.responseHeaders,
        };

        let responseBody = {}
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
  }
}

module.exports = Mocker;
