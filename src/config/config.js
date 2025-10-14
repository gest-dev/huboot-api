import dotenv from 'dotenv';
dotenv.config(); // garante que process.env está carregado
// Port number
const PORT = process.env.PORT || '3333'
const TOKEN = process.env.TOKEN || ''

const RESTORE_SESSIONS_ON_START_UP = !!(
    process.env.RESTORE_SESSIONS_ON_START_UP &&
    process.env.RESTORE_SESSIONS_ON_START_UP === 'true'
)

const APP_URL = process.env.APP_URL || false

const LOG_LEVEL = process.env.LOG_LEVEL

const INSTANCE_MAX_RETRY_QR = process.env.INSTANCE_MAX_RETRY_QR || 2

const CLIENT_PLATFORM = process.env.CLIENT_PLATFORM || 'Whatsapp MD'
const CLIENT_BROWSER = process.env.CLIENT_BROWSER || 'Chrome'
const CLIENT_VERSION = process.env.CLIENT_VERSION || '4.0.0'

// Enable or disable mongodb
const MONGODB_ENABLED = !!(
    process.env.MONGODB_ENABLED && process.env.MONGODB_ENABLED === 'true'
)
// URL of the Mongo DB
const MONGODB_URL =
    process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/'
const MONGODB_DB_NAME = process.env.MONGO_DATABASE_NAME || 'WhatsAppInstance'

// Mark messages as seen
const MARK_MESSAGES_READ = !!(
    process.env.MARK_MESSAGES_READ && process.env.MARK_MESSAGES_READ === 'true'
)
const version = process.env.SET_VERSION_WHATSAPP.split('.').map(Number);

export default {
    port: PORT,
    token: TOKEN,
    restoreSessionsOnStartup: RESTORE_SESSIONS_ON_START_UP,
    appUrl: APP_URL,
    version_connect: version,
    log: {
        level: LOG_LEVEL,
    },
    instance: {
        maxRetryQr: INSTANCE_MAX_RETRY_QR,
    },
    mongoose: {
        enabled: MONGODB_ENABLED,
        url: MONGODB_URL,
        dbName: MONGODB_DB_NAME,
        options: {
            // useCreateIndex: true,
            // useNewUrlParser: true, // deprecated
            // useUnifiedTopology: true, // deprecated
        },
    },
    browser: {
        platform: CLIENT_PLATFORM,
        browser: CLIENT_BROWSER,
        version: CLIENT_VERSION,
    },
    markMessagesRead: MARK_MESSAGES_READ,
    auth: {
        AUTH_REGISTER_MORE: process.env.AUTH_REGISTER_MORE || 'false',
        SECRET: process.env.SECRET,
        TOKEN: process.env.TOKEN || '',
    }
}
