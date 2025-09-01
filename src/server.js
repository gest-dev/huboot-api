import mongoose from 'mongoose';
import pino from 'pino';
import semver from 'semver';
import app from './config/express.js';
import config from './config/config.js';
import Session from './api/class/session.js';
import connectToCluster from './api/helper/connectMongoClient.js';

const logger = pino();
const requiredNodeVersion = '>=20.0.0 <23.0.0';


if (!semver.satisfies(process.version, requiredNodeVersion)) {
    console.error(`Erro: Esta aplicação requer Node.js na versão ${requiredNodeVersion}. Versão atual: ${process.version}`);
    process.exit(1);

}

let server

if (config.mongoose.enabled) {
    mongoose.set('strictQuery', true);
    mongoose.connect(`${config.mongoose.url}/${config.mongoose.dbName}`, config.mongoose.options).then(() => {
        logger.info('Connected to MongoDB')
    })
}

server = app.listen(config.port, async () => {
    logger.info(`Listening on port ${config.port}`)
    global.mongoClient = await connectToCluster(`${config.mongoose.url}/${config.mongoose.dbName}`)
    if (config.restoreSessionsOnStartup) {
        logger.info(`Restoring Sessions`)
        const session = new Session()
        let restoreSessions = await session.restoreSessions()
        logger.info(`${restoreSessions.length} Session(s) Restored`)
    }
})

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info('Server closed')
            process.exit(1)
        })
    } else {
        process.exit(1)
    }
}

const unexpectedErrorHandler = (error) => {
    logger.error(error)
    exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', () => {
    logger.info('SIGTERM received')
    if (server) {
        server.close()
    }
})

export default server;

