const express = require("express");
const app = express();
const logger = require("./server/config/logger");
const morgan = require("morgan");

app.use(morgan("dev"));

//Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//db config
require("./server/config/config");
require("./server/config/dbConfig").connectToDB();

//routes
app.use(require("./server/router/router"));

app.set("port", process.env.SERVER_PORT);

app.listen(app.get("port"), (server) => {
  logger.info(`Server listen on port ${app.get("port")}`);
});
