const express = require('express');
const app = express();

require('./server/config/config');
require('./server/config/dbConfig').connectToDB();
app.use(require('./server/router/router'));

app.set('port', process.env.SERVER_PORT);

app.listen(app.get('port'), server => {
    console.info(`Server listen on port ${app.get('port')}`);
});