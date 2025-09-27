import { MongoClient } from 'mongodb';
import pino from 'pino';
const logger = pino();


export default async function connectToCluster(uri) {
    let mongoClient

    try {
        mongoClient = new MongoClient(uri, {
            // useNewUrlParser: true, // deprecated
            // useUnifiedTopology: true, // deprecated
        })
        logger.info('STATE: Connecting to MongoDB')
        await mongoClient.connect()
        logger.info('STATE: Successfully connected to MongoDB')
        return mongoClient
    } catch (error) {
        logger.error('STATE: Connection to MongoDB failed!', error)
        process.exit()
    }
}
