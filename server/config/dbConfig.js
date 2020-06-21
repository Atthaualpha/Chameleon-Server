const mongoDB = require('mongodb');
const logger = require('./logger');

let clientConnection;

const connectToDB = async () => {
  if (!clientConnection) {
    clientConnection = new mongoDB.MongoClient(process.env.DB_URL, {
      useUnifiedTopology: true,
    });
    await clientConnection
      .connect()
      .then(() => {
        logger.info('DB connected!!!');
      })
      .catch((err) => {
        logger.error(err);
        throw new Error('Error connecting to DB!!!');
      });
  }
};

const getConnection = () => {
  return clientConnection.db(process.env.DB_NAME);
};

module.exports = {
  connectToDB,
  getConnection,
};
