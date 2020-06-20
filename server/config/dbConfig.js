
const mongoDB = require('mongodb');

let clientConnection;

const connectToDB = async () => {

    if (!clientConnection) {
        clientConnection = new mongoDB.MongoClient(process.env.DB_URL, { useUnifiedTopology: true } );
        await clientConnection.connect()
        .then(() => {
            console.log('DB connected!!!');
        }            
        ).catch(err => {
            console.log(err);
            throw new Error('Error connecting to DB!!!');            
        });
    }
    
    return clientConnection.db(process.env.DB_NAME);   
}

const getConnection = () => {
    return connectToDB();
}


module.exports = {
    connectToDB,
    getConnection
}

