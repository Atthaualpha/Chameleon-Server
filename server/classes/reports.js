const cnn = require('../config/dbConfig');
const logger = require('../config/logger');

const collection = 'request';

class Reports {
  async findRequestByProjects(callback) {
    cnn.getDb().collection(collection).aggregate(this.buildQueryReportProjects())
    .toArray((err, result) => {
        if(err){
            logger.error(err)
            return callback(err)
        }
        callback(null, result)
    });
  }

  buildQueryReportProjects() {
    return [
      {
        $group: {
          _id: {
            projectId: '$projectId',
            method: '$method',
          },
          totalMethods: {
            $sum: 1,
          },
        },
      },
      {
        $group: {
          _id: '$_id.projectId',
          methods: {
            $push: {
              method: '$_id.method',
              count: '$totalMethods',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'project',
          localField: '_id',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $unwind: {
          path: '$project',
        },
      },
      {
        $project: {
          _id: 0,
          projectId: '$_id',
          projectName: '$project.name',
          methods: {$map: {input: "$methods", as: "method", in: ["$$method.method","$$method.count"] } }
        },
      },
    ];
  }
}

module.exports = Reports;
