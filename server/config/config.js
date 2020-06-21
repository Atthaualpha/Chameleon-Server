//========================
// Port Config
//========================

process.env.SERVER_PORT = process.env.port || 3000;

//========================
// DB Config
//========================

const urlDB = 'mongodb://localhost:27017';

process.env.DB_URL = process.env.DB_URL || urlDB;

const dbName = 'cham-tree';

process.env.DB_NAME = dbName;
