/* eslint-disable no-unsafe-optional-chaining */
const { WhatsAppInstance } = require('../class/instance')
const logger = require('pino')()
const config = require('../../config/config')
const Instances = require("../models/instances.model");
class Session {
    async restoreSessions(keyNames = []) {
        console.log('opening mongo connection restoreSessions')
        let restoredSessions = new Array()
        let allCollections = []
        try {
            const db = mongoClient.db(config.mongoose.dbName)
            //const result = await db.listCollections().toArray()
            const result = await Instances.find().exec()
            result.forEach((collection) => {
                // se passado key name ele só vai restaurar a instancia com o nome passado
                if (keyNames.length > 0) {
                    if (keyNames.includes(collection.key)) {
                        allCollections.push(collection.key)
                    }
                } else {
                    allCollections.push(collection.key)
                }
            })

            allCollections.map((key) => {
                const query = {}
                db.collection(key)
                    .find(query)
                    .toArray(async (err, result) => {
                        if (err) throw err                   
                        const instance = new WhatsAppInstance(
                            key,
                        )
                        await instance.init()
                        WhatsAppInstances[key] = instance
                    })
                restoredSessions.push(key)
            })
        } catch (e) {

            logger.error('Error restoring sessions')
            logger.error(e)
        }
        return restoredSessions
    }
}

exports.Session = Session
