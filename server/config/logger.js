const { createLogger, format, transports } = require("winston");
const moment = require("moment");

const tsFormat = () => moment().format("YYYY-MM-DD hh:mm:ss").trim();

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 5,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "blue",
  debug: "green",
};

const colorizer = format.colorize({ colors });

const logger = createLogger({
  levels,
  format: format.combine(
    format.timestamp({ format: tsFormat }),
    // format.printf((info) => `[${info.time}] [${info.level}] [${info.message}]`)
    format.printf((msg) =>
      colorizer.colorize(
        msg.level,
        `[${msg.timestamp}] - [${msg.level.toUpperCase()}] => ${msg.message}`
      )
    )
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
