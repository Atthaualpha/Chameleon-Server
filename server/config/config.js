const properties = require('./dbProperties.json');

//========================
// Port Config
//========================

process.env.SERVER_PORT = process.env.port || 3000;

//========================
// Enviroment
//========================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//========================
// DB Config
//========================

let urlDB;

const dbName = 'cham-tree';

process.env.DB_NAME = dbName;

const devLocalDb = `mongodb://localhost:27017/${dbName}?retryWrites=true&w=majority`;
const devAtlasDb = `mongodb+srv://${properties.user}:${properties.pass}@clusterattha-b1ery.mongodb.net/${dbName}?retryWrites=true&w=majority`;

if (process.env.NODE_ENV === 'dev') {
  urlDB = devAtlasDb;
} else {
  urlDB = process.env.MONGO_URL;
}

process.env.DB_URL = urlDB;
