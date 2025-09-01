import WhatsAppInstance from '../class/instance.js';
import fs from 'fs';
import path from 'path';
import config from '../../config/config.js';
import Session from '../class/session.js';
import schemaNewInstance from '../schemas/new_instance.schemas.js';
import Utils from '../helper/utils.js';
import AuthAccessToken from '../class/authAccessToken.js';
import Instances from '../models/instances.model.js';
import GroupsModel from '../models/Groups.model.js';
import ContactsModel from '../models/Contacts.model.js';
import InstanceConfigWebhook from '../models/InstanceConfigWebhook.model.js';


async function newInstance(req, res) {

    try {
        const { error, value } = schemaNewInstance.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            const firstError = error.details[0].message.replaceAll('"', "");
            const allErrors = {};

            error.details.forEach((detail) => {
                const keyText = detail.path[0];
                const errorMessage = detail.message.replaceAll('"', "");

                if (!allErrors[keyText]) {
                    allErrors[keyText] = [];
                }
                allErrors[keyText].push(errorMessage);
            });

            return res.status(422).json({
                message: firstError,
                errors: allErrors,
            });
        }

        const { name } = req.body;

        // verifica se o name já existe
        const instanceExists = await Instances.findOne({
            name: name,
        });

        if (instanceExists) {
            return res.status(404).json(
                {
                    message: "Nome já cadastrado.",
                    errors: {
                        name: ["Nome já cadastrado."],
                    },
                }
            );
        }

        // generate key instance
        const key = await Utils.generateUuid();
        // create instance token
        const token = await AuthAccessToken.generateAccessTokenInstance({ key: key });

        const instance = new Instances({
            name: name,
            key: key,
            token: token,
        });

        await instance.save();
        return res.json({
            error: false,
            message: 'Instance created successfully',
            data: {
                key: key,
                token: token,
            },
        });
    }
    catch (error) {

        return res.status(500).json({
            error: true,
            message: 'Error creating instance',
            data: error,
        });
    }

}
async function list(req, res) {

    // if (req.query.active) {
    //     let instance = []
    //     const db = mongoClient.db(config.mongoose.dbName)
    //     const result = await db.listCollections().toArray()
    //     result.forEach((collection) => {
    //         instance.push(collection.name)
    //     })

    //     return res.json({
    //         error: false,
    //         message: 'All active instance',
    //         data: instance,
    //     })
    // }


    // listamso as instancias salvas no banco
    let InstancesList = await Instances.find({});

    let dataInstance = [];
    for (const instance of InstancesList) {

        let instanceWp = {
            name: instance.name,
            key: instance.key,
            token: instance.token,
            createdAt: instance.createdAt,
        };
        if (WhatsAppInstances[instance.key]) {
            instanceWp['instance_session'] = await WhatsAppInstances[instance.key].getInstanceDetail(instance.key)
        } else {
            instanceWp['instance_session'] = null
        }
        dataInstance.push(instanceWp)
    }

    return res.json({
        error: false,
        message: 'All instance listed',
        data: dataInstance,
    })
}

async function init(req, res) {

    const key = req.query.key
    let InstanceInfo = await Instances.findOne({ key: key });
    if (!InstanceInfo) {
        return res.status(422).json({
            "error": true,
            "message": "invalid key supplied DB"
        })
    }
    let InstanceInfoWp = {
        name: InstanceInfo.name,
        key: InstanceInfo.key,
        token: InstanceInfo.token,
        createdAt: InstanceInfo.createdAt,
    };

    const appUrl = config.appUrl || req.protocol + '://' + req.headers.host
    const instance = new WhatsAppInstance(key)
    const data = await instance.init()
    WhatsAppInstances[data.key] = instance

    InstanceInfoWp['instance_session'] = await WhatsAppInstances[data.key].getInstanceDetail(data.key)
    const instanceConfigWebhookConfig = await InstanceConfigWebhook.findOne({ instance: data.key });
    let webhookInfo = null;
    if (instanceConfigWebhookConfig) {
        webhookInfo = {
            enabled: instanceConfigWebhookConfig.status,
            webhookUrl: instanceConfigWebhookConfig.url,
        };
    } else {
        webhookInfo = {
            enabled: null,
            webhookUrl: null,
        }
    }
    res.json({
        error: false,
        message: 'Initializing successfully',
        key: data.key,
        InstanceInfoWp: InstanceInfoWp,
        webhook: webhookInfo,
        browser: config.browser,
    })
}

async function qr(req, res) {
    try {
        const qrcode = await WhatsAppInstances[req.query.key]?.instance.qr
        res.render('qrcode', {
            qrcode: qrcode,
        })
    } catch {
        res.json({
            qrcode: '',
        })
    }
}

async function qrbase64(req, res) {
    try {
        const key = req.query.key
        let InstanceInfo = await Instances.findOne({ key: key });
        if (!InstanceInfo) {
            return res.status(422).json({
                "error": true,
                "message": "invalid key supplied DB"
            })
        }
        if (!WhatsAppInstances[key]) {
            return res.status(422).json({
                "error": true,
                "message": "invalid key supplied"
            })
        }
        const qrcode = await WhatsAppInstances[req.query.key]?.instance.qr
        return res.json({
            error: false,
            message: 'QR Base64 fetched successfully',
            qrcode: qrcode,
        })
    } catch {
        return res.status(500).json({
            error: true,
            qrcode: '',
        })
    }
}

async function info(req, res) {
    const key = req.query.key
    let InstanceInfo = await Instances.findOne({ key: key });
    if (!InstanceInfo) {
        return res.status(422).json({
            "error": true,
            "message": "invalid key supplied DB"
        })
    }
    let InstanceInfoWp = {
        name: InstanceInfo.name,
        key: InstanceInfo.key,
        token: InstanceInfo.token,
        createdAt: InstanceInfo.createdAt,
    };
    const instance = WhatsAppInstances[key]

    try {
        if (!instance) {
            InstanceInfoWp['instance_session'] = null
        } else {
            InstanceInfoWp['instance_session'] = await instance.getInstanceDetail(key)
        }
    } catch (error) {
        InstanceInfoWp['instance_session'] = null
    }
    return res.json({
        error: false,
        message: 'Instance fetched successfully',
        instance_data: InstanceInfoWp,
    })
}

async function restoreAll(req, res, next) {
    try {
        const session = new Session()
        let restoredSessions = await session.restoreSessions()
        return res.json({
            error: false,
            message: 'All instances restored',
            data: restoredSessions,
        })
    } catch (error) {
        next(error)
    }
}

async function restore(req, res, next) {
    try {
        const key = req.query.key
        let InstanceInfo = await Instances.findOne({ key: key });
        if (!InstanceInfo) {
            return res.status(422).json({
                "error": true,
                "message": "invalid key supplied DB"
            })
        }
        const session = new Session()
        let restoredSessions = await session.restoreSessions([key])
        return res.json({
            error: false,
            message: 'Instance restored',
            data: restoredSessions,
        })
    } catch (error) {
        next(error)
    }
}

async function logout(req, res, next) {
    let errormsg
    const key = req.query.key
    try {
        await WhatsAppInstances[key].instance?.sock?.logout()
    } catch (error) {
        errormsg = error
    }
    return res.json({
        error: false,
        message: 'logout successfull',
        errormsg: errormsg ? errormsg : null,
    })
}

async function deleteInstance(req, res, next) {
    let errormsg
    try {
        await WhatsAppInstances[req.query.key].deleteInstance(req.query.key)
        delete WhatsAppInstances[req.query.key]
    } catch (error) {
        errormsg = error
    }
    return res.json({
        error: false,
        message: 'Instance deleted successfully',
        data: errormsg ? errormsg : null,
    })
}

async function deleteGeneral(req, res) {

    const key = req.query.key
    let InstanceInfo = await Instances.findOne({ key: key });
    if (!InstanceInfo) {
        return res.status(422).json({
            "error": true,
            "message": "invalid key supplied DB"
        })
    }
    let erroMessage = null;
    try {
        if (WhatsAppInstances[key]) {
            await WhatsAppInstances[key].instance?.sock?.logout();
        }

    } catch (error) {
        erroMessage = error;
    }
    // agaurda alguns segundos para garantir que o logout foi feito
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
        if (WhatsAppInstances[key]) {
            await WhatsAppInstances[req.query.key].deleteInstance(req.query.key);
            delete WhatsAppInstances[req.query.key];
        }
    } catch (error) {
        erroMessage = error;
    }

    // remove todos os contatos e grupos do banco de dados
    try {
        const groupsResult = await GroupsModel.deleteMany({ instance: key });
        const contactsResult = await ContactsModel.deleteMany({ instance: key });
        console.log(`Groups deletados: ${groupsResult.deletedCount}`);
        console.log(`Contacts deletados: ${contactsResult.deletedCount}`);
    } catch (error) {
        erroMessage = error;
    }

    // vamso agora na collection instances deletar
    await Instances.deleteOne({ key: key });
    return res.json({
        error: false,
        message: 'Instance deleted successfully',
        data: null,
    })
}

async function status(req, res) {
    const key = req.query.key
    let InstanceInfo = await Instances.findOne({ key: key });
    if (!InstanceInfo) {
        return res.status(422).json({
            "error": true,
            "message": "invalid key supplied DB"
        })
    }
    let InstanceInfoWp = {
        name: InstanceInfo.name,
        createdAt: InstanceInfo.createdAt,
    };
    const instance = WhatsAppInstances[key]

    try {
        if (!instance) {
            InstanceInfoWp['instance_session'] = null
        } else {
            InstanceInfoWp['instance_session'] = await instance.getInstanceDetail(key)
        }
    } catch (error) {
        InstanceInfoWp['instance_session'] = null
    }
    return res.json({
        error: false,
        message: 'Instance fetched successfully',
        instance_data: InstanceInfoWp,
    })
}


export default {
    newInstance,
    list,
    init,
    qr,
    qrbase64,
    info,
    restoreAll,
    restore,
    logout,
    deleteInstance,
    deleteGeneral,
    status
};
