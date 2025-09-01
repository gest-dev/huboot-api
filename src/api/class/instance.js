import InstanceConfigWebhook from "../models/InstanceConfigWebhook.model.js";
import QRCode from "qrcode";
import pino from "pino";
import makeWASocket, { DisconnectReason } from "@whiskeysockets/baileys";
import { unlinkSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import processButton from "../helper/processbtn.js";
import generateVC from "../helper/genVc.js";
import Chat from "../models/chat.model.js";
import axios from "axios";
import config from "../../config/config.js";
import downloadMessage from "../helper/downloadMsg.js";
const logger = pino();
import useMongoDBAuthState from "../helper/mongoAuthState.js";
import Contacts from "../models/Contacts.model.js";
import Groups from "../models/Groups.model.js";
import InstancesModel from "../models/instances.model.js";



class WhatsAppInstance {
    socketConfig = {
        defaultQueryTimeoutMs: undefined,
        printQRInTerminal: false,
        logger: pino({
            level: config.log.level,
        }),
    }
    key = ''
    authState

    instance = {
        key: this.key,
        chats: [],
        qr: '',
        messages: [],
        qrRetry: 0,
    }



    constructor(key) {
        this.key = key ? key : uuidv4()

    }

    async SendWebhook(event, body, key, instanceConfigWebhookConfig, type_send_message = 'other') {

        if (!instanceConfigWebhookConfig || instanceConfigWebhookConfig.status === false) return

        const axiosInstance = axios.create({
            baseURL: instanceConfigWebhookConfig.url,
        })

        //let messageToString = JSON.stringify(body)
        let bodyData = {
            instanceKey: key,
            type_send_message,
            event,
            data: body
        }
        await axiosInstance
            .post('', bodyData)
            .then((response) => {
                //console.log('Webhook sent: ', response.data)
            })
            .catch((error) => {
                console.log('Error sending webhook: ', error.message)
            })
    }

    async init() {
        this.collection = mongoClient.db(config.mongoose.dbName).collection(this.key)
        const { state, saveCreds } = await useMongoDBAuthState(this.collection)
        this.authState = { state: state, saveCreds: saveCreds }
        this.socketConfig.auth = this.authState.state
        this.socketConfig.browser = Object.values(config.browser)
        this.instance.sock = makeWASocket(this.socketConfig)

        this.setHandler()
        // Listener para pegar todos os grupos assim que conectar
        // const fetchGroups = async (update) => {
        //     if (update.connection === 'open') {
        //         try {
        //             const groups = await this.instance.sock.groupFetchAllParticipating()

        //             // Salvar no DB se quiser
        //             await this.saveContactsAndGroups(Object.values(groups))

        //             // Remove o listener para não disparar novamente
        //             this.instance.sock.ev.off('connection.update', fetchGroups)
        //         } catch (e) {
        //             console.error("Erro ao buscar grupos:", e)
        //         }
        //     }
        // }

        // this.instance.sock.ev.on('connection.update', fetchGroups)

        return this
    }

    setHandler() {
        const sock = this.instance.sock;

        // on credentials update save state
        sock?.ev.on('creds.update', this.authState.saveCreds);

        // on socket closed, opened, connecting
        sock?.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            //console.log(`Connection update: ${connection}`);

            if (connection === 'connecting') return;

            if (connection === 'close') {
                //console.log('Connection closed');

                // reconnect if not logged out
                if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    await this.init();
                } else {
                    await this.collection.drop().then((r) => {
                        logger.info('STATE: Dropped collection');
                    });
                    this.instance.online = false;

                    // busca instance no banco Instances verifica a key se existe e se existir salva connectedNumber em lastPhoneId
                    let instanceDatabase = await InstancesModel.findOne({ key: this.key });
                    if (instanceDatabase) {
                        instanceDatabase.phoneIdConnected = null;
                        await instanceDatabase.save();
                    }
                }
                const instanceConfigWebhookConfig = await InstanceConfigWebhook.findOne({ instance: this.key });

                if (instanceConfigWebhookConfig &&
                    ['all', 'connection', 'connection.update', 'connection:close'].some((e) => instanceConfigWebhookConfig.events.includes(e))) {
                    await this.SendWebhook('connection', { connection: connection }, this.key, instanceConfigWebhookConfig);
                }
            } else if (connection === 'open') {
                // console.log('Connection opened');

                if (config.mongoose.enabled) {
                    let alreadyThere = await Chat.findOne({ key: this.key }).exec();
                    if (!alreadyThere) {
                        const saveChat = new Chat({ key: this.key });
                        await saveChat.save();
                    }
                }

                // Obter o número conectado
                const connectedNumber = sock?.user?.id || sock?.user?.jid;
                if (connectedNumber) {
                    //DownloadProfile

                    // busca instance no banco Instances verifica a key se existe e se existir salva connectedNumber em lastPhoneId
                    let instanceDatabase = await InstancesModel.findOne({ key: this.key });
                    if (instanceDatabase) {
                        instanceDatabase.phoneIdConnected = connectedNumber;
                        await instanceDatabase.save();
                    }
                }

                this.instance.online = true;
                const instanceConfigWebhookConfig = await InstanceConfigWebhook.findOne({ instance: this.key });
                if (instanceConfigWebhookConfig && ['all', 'connection', 'connection.update', 'connection:open'].some((e) => instanceConfigWebhookConfig.events.includes(e))) {
                    await this.SendWebhook('connection', { connection: connection }, this.key, instanceConfigWebhookConfig);
                }

            }

            if (qr) {
                QRCode.toDataURL(qr).then((url) => {
                    this.instance.qr = url;
                    this.instance.qrRetry++;
                    if (this.instance.qrRetry >= config.instance.maxRetryQr) {
                        // close WebSocket connection
                        this.instance.sock.ws.close();
                        // remove all events
                        this.instance.sock.ev.removeAllListeners();
                        this.instance.qr = ' ';
                        logger.info('socket connection terminated');
                    }
                });
            }
        });

        // sending presence
        sock?.ev.on('presence.update', async (json) => {

            const instanceConfigWebhookConfig = await InstanceConfigWebhook.findOne({ instance: this.key });
            if (instanceConfigWebhookConfig &&
                ['all', 'presence', 'presence.update'].some((e) =>
                    instanceConfigWebhookConfig.events.includes(e)
                )
            ) {
                await this.SendWebhook('presence', json, this.key, instanceConfigWebhookConfig);
            }

        })

        // contacts update
        sock?.ev.on('contacts.update', async (json) => {

            const instanceConfigWebhookConfig = await InstanceConfigWebhook.findOne({ instance: this.key });
            if (instanceConfigWebhookConfig &&
                ['all', 'contacts', 'contacts.update'].some((e) =>
                    instanceConfigWebhookConfig.events.includes(e)
                )
            ) {
                await this.SendWebhook('contacts', json, this.key, instanceConfigWebhookConfig);
            }
        })

        //If you only want to export all the numbers saved in your contact list, you can do it as follows:
        sock?.ev.on('contacts.upsert', async (data) => {
            //console.log('contacts.upsert');

            const instanceConfigWebhookConfig = await InstanceConfigWebhook.findOne({ instance: this.key });
            if (instanceConfigWebhookConfig &&
                ['all', 'contacts', 'contacts.upsert'].some((e) =>
                    instanceConfigWebhookConfig.events.includes(e)
                )
            ) {
                await this.SendWebhook('contacts', data, this.key, instanceConfigWebhookConfig);
            }

        })
        //If you want to export numbers from all your previous individual conversations, you can do it as follows:
        sock.ev.on('messaging-history.set', async (data) => {
            // console.log(data);
            // console.log('messaging-history.set');


            const messagingHistoryData = data.contacts;
            const instanceConfigWebhookConfig = await InstanceConfigWebhook.findOne({ instance: this.key });
            if (instanceConfigWebhookConfig &&
                ['all', 'contacts-history', 'messaging-history.set'].some((e) =>
                    instanceConfigWebhookConfig.events.includes(e)
                )
            ) {
                const filteredContacts = messagingHistoryData.filter((item) =>
                    item.id.endsWith("@s.whatsapp.net")
                );
                await this.SendWebhook('contacts', filteredContacts, this.key, instanceConfigWebhookConfig);
            }

            this.saveContactsAndGroups(messagingHistoryData);

        });


        // on receive all chats
        sock?.ev.on('chats.set', async ({ chats }) => {
            this.instance.chats = []
            const recivedChats = chats.map((chat) => {
                return {
                    ...chat,
                    messages: [],
                }
            })
            this.instance.chats.push(...recivedChats)
            await this.updateDb(this.instance.chats)
            await this.updateDbGroupsParticipants()
        })

        // on recive new chat
        sock?.ev.on('chats.upsert', (newChat) => {
            // console.log('chats.upsert')
            // console.log(newChat)
            const chats = newChat.map((chat) => {
                return {
                    ...chat,
                    messages: [],
                }
            })
            this.instance.chats.push(...chats)
        })

        // on chat change
        sock?.ev.on('chats.update', (changedChat) => {
            //console.log('chats.update')
            //console.log(changedChat)
            changedChat.map((chat) => {
                const index = this.instance.chats.findIndex(
                    (pc) => pc.id === chat.id
                )
                const PrevChat = this.instance.chats[index]
                this.instance.chats[index] = {
                    ...PrevChat,
                    ...chat,
                }
            })
        })

        // on chat delete
        sock?.ev.on('chats.delete', (deletedChats) => {
            //console.log('chats.delete')
            //console.log(deletedChats)
            deletedChats.map((chat) => {
                const index = this.instance.chats.findIndex(
                    (c) => c.id === chat
                )
                this.instance.chats.splice(index, 1)
            })
        })

        // on new mssage
        sock?.ev.on('messages.upsert', async (m) => {

            //console.log(m)
            if (m.type === 'prepend')
                this.instance.messages.unshift(...m.messages)
            if (m.type !== 'notify') return

            // https://adiwajshing.github.io/Baileys/#reading-messages
            if (config.markMessagesRead) {
                const unreadMessages = m.messages.map((msg) => {
                    return {
                        remoteJid: msg.key.remoteJid,
                        id: msg.key.id,
                        participant: msg.key?.participant,
                    }
                })
                await sock.readMessages(unreadMessages)
            }

            this.instance.messages.unshift(...m.messages)

            m.messages.map(async (msg) => {

                if (!msg.message) return

                const messageType = Object.keys(msg.message)[0]
                if (
                    [
                        'protocolMessage',
                        'senderKeyDistributionMessage',
                    ].includes(messageType)
                ) {
                    return
                }

                const webhookData = {
                    key: this.key,
                    ...msg,
                }

                if (messageType === 'conversation') {
                    webhookData['text'] = m
                }

                const instanceConfigWebhookConfig = await InstanceConfigWebhook.findOne({ instance: this.key });
                if (instanceConfigWebhookConfig && instanceConfigWebhookConfig.base64) {
                    switch (messageType) {
                        case 'imageMessage':
                            webhookData['msgContent'] = await downloadMessage(
                                msg.message.imageMessage,
                                'image'
                            )
                            break
                        case 'videoMessage':
                            webhookData['msgContent'] = await downloadMessage(
                                msg.message.videoMessage,
                                'video'
                            )
                            break
                        case 'audioMessage':
                            webhookData['msgContent'] = await downloadMessage(
                                msg.message.audioMessage,
                                'audio'
                            )
                            break
                        default:
                            webhookData['msgContent'] = ''
                            break
                    }
                }

                if (instanceConfigWebhookConfig &&
                    ['all', 'messages', 'messages.upsert'].some((e) =>
                        instanceConfigWebhookConfig.events.includes(e)
                    )
                ) {

                    if (webhookData?.pushName && !webhookData?.key?.participant) {
                        //console.log('Chegou webhookData de  direct_user: ', webhookData);
                        // tipo de mensgaem
                        const type_send_message = 'direct_user';
                        await this.SendWebhook('messages.upsert', webhookData, this.key, instanceConfigWebhookConfig, type_send_message);
                    } else {
                        //console.log('Chegou webhookData de  group: ', webhookData);
                        // tipo de mensgaem
                        const type_send_message = 'group';
                        await this.SendWebhook('messages.upsert', webhookData, this.key, instanceConfigWebhookConfig, type_send_message);
                    }

                }

            })
        })

        sock?.ev.on('messages.update', async (messages) => {
            //console.log('entrou no on messages.update')
            //console.dir(messages);
        })
        sock?.ws.on('CB:call', async (data) => {
            if (data.content) {
                if (data.content.find((e) => e.tag === 'offer')) {
                    const content = data.content.find((e) => e.tag === 'offer')
                    const instanceConfigWebhookConfig = await InstanceConfigWebhook.findOne({ instance: this.key });
                    if (instanceConfigWebhookConfig &&
                        ['all', 'call', 'CB:call', 'call:offer'].some((e) =>
                            instanceConfigWebhookConfig.events.includes(e)
                        )
                    )
                        await this.SendWebhook(
                            'call_offer',
                            {
                                id: content.attrs['call-id'],
                                timestamp: parseInt(data.attrs.t),
                                user: {
                                    id: data.attrs.from,
                                    platform: data.attrs.platform,
                                    platform_version: data.attrs.version,
                                },
                            },
                            this.key
                        )
                } else if (data.content.find((e) => e.tag === 'terminate')) {
                    const content = data.content.find(
                        (e) => e.tag === 'terminate'
                    )

                    const instanceConfigWebhookConfig = await InstanceConfigWebhook.findOne({ instance: this.key });
                    if (instanceConfigWebhookConfig &&
                        ['all', 'call', 'call:terminate'].some((e) =>
                            instanceConfigWebhookConfig.events.includes(e)
                        )
                    )
                        await this.SendWebhook(
                            'call_terminate',
                            {
                                id: content.attrs['call-id'],
                                user: {
                                    id: data.attrs.from,
                                },
                                timestamp: parseInt(data.attrs.t),
                                reason: data.content[0].attrs.reason,
                            },
                            this.key
                        )
                }
            }
        })

        sock?.ev.on('groups.upsert', async (newChat) => {

            // console.log(newChat)
            // console.log('groups.upsert')
            this.createGroupByApp(newChat)
            const instanceConfigWebhookConfig = await InstanceConfigWebhook.findOne({ instance: this.key });
            if (instanceConfigWebhookConfig &&
                ['all', 'groups', 'groups.upsert'].some((e) =>
                    instanceConfigWebhookConfig.events.includes(e)
                )
            )
                await this.SendWebhook(
                    'group_created',
                    {
                        data: newChat,
                    },
                    this.key
                )
        })

        sock?.ev.on('groups.update', async (newChat) => {
            // console.log(newChat)
            // console.log('groups.update')
            this.updateGroupSubjectByApp(newChat)
            const instanceConfigWebhookConfig = await InstanceConfigWebhook.findOne({ instance: this.key });
            if (instanceConfigWebhookConfig &&
                ['all', 'groups', 'groups.update'].some((e) =>
                    instanceConfigWebhookConfig.events.includes(e)
                )
            )
                await this.SendWebhook(
                    'group_updated',
                    {
                        data: newChat,
                    },
                    this.key
                )
        })

        sock?.ev.on('group-participants.update', async (newChat) => {
            //console.log(newChat)
            console.log('group-participants.update')
            this.updateGroupParticipantsByApp(newChat)
            const instanceConfigWebhookConfig = await InstanceConfigWebhook.findOne({ instance: this.key });
            if (instanceConfigWebhookConfig &&
                [
                    'all',
                    'groups',
                    'group_participants',
                    'group-participants.update',
                ].some((e) => instanceConfigWebhookConfig.events.includes(e))
            )
                await this.SendWebhook(
                    'group_participants_updated',
                    {
                        data: newChat,
                    },
                    this.key
                )
        })
    }

    async deleteInstance(key) {
        try {
            await Chat.findOneAndDelete({ key: key })
        } catch (e) {
            logger.error('Error updating document failed')
        }
    }
    calcTimesTempToUptime(SyncTimestamp) {
        // Obter o timestamp atual em milissegundos (em UTC)
        const now = new Date().getTime();
        const timesSync = new Date(SyncTimestamp * 1000).getTime(); // Converte SyncTimestamp para milissegundos

        // Calcular a diferença de tempo entre o timestamp atual e o SyncTimestamp
        const diff = now - timesSync;

        // Converter a diferença em dias, horas, minutos e segundos
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Retornar a diferença no formato "Xd Xh Xm Xs"
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    timesTempToFomart(timestamp) {

        const date = new Date(timestamp * 1000);
        // formato brasileiro 0d 0h 0m 0s
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }


    async getInstanceDetail(key) {


        let user = {};
        if (this.instance?.online) {

            user = this.instance.sock?.user
            try {
                let getProfilePictureUrl = await WhatsAppInstances[key].getProfilePictureUrl(user?.id)
                //console.log('urlImgProfile', getProfilePictureUrl);
                user['profile_img'] = getProfilePictureUrl;
            } catch (error) {
                //console.log(error.message);
            }
        }

        return {
            instance_key: key,
            phone_connected: this.instance?.online,
            user: user,
            //authState.creds.lastAccountSyncTimestamp
            uptime: ((this.instance?.online && this.instance.sock?.authState && this.instance.sock?.authState.creds.lastAccountSyncTimestamp)
                ? this.calcTimesTempToUptime(this.instance.sock?.authState.creds.lastAccountSyncTimestamp)
                : '0d 0h 0m 0s'),
            last_sync: ((this.instance?.online && this.instance.sock?.authState && this.instance.sock?.authState.creds.lastAccountSyncTimestamp)
                ? this.timesTempToFomart(this.instance.sock?.authState.creds.lastAccountSyncTimestamp)
                : '---------'),

        }
    }

    getWhatsAppId(id) {
        if (id.includes('@g.us') || id.includes('@s.whatsapp.net')) return id
        return id.includes('-') ? `${id}@g.us` : `${id}@s.whatsapp.net`
    }

    async verifyId(id) {

        if (id.includes('@g.us')) {
            const resultAllGroup = await this.instance.sock?.groupMetadata(id)
            if (resultAllGroup.id) {
                return {
                    jid: resultAllGroup.id,
                    exists: true,
                    lid: '',
                };
            } else {
                throw new Error('group not found');
            }
        } else {
            const resultAll = await this.instance.sock?.onWhatsApp(id)
            if (resultAll.length > 0 && resultAll[0]?.exists) return resultAll[0];
            throw new Error('no account exists')
        }

    }

    async sendTextMessage(to, message) {
        const formattedId = this.getWhatsAppId(to);

        try {

            let resultVerifyId = await this.verifyId(formattedId);

            // Verificar se a sessão está estabelecida
            if (!this.instance.sock) {
                throw new Error('Socket instance is not initialized');
            }

            if (!resultVerifyId?.exists) {
                throw new Error('id not working or not found');
            }

            // Aumentar a duração do timeout para 60 segundos
            const data = await Promise.race([
                this.instance.sock.sendMessage(resultVerifyId.jid, { text: message }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Message sending timed out')), 60000)) // Timeout de 60 segundos
            ]);
            return data;
        } catch (error) {
            console.error(`Error sending message: ${error.message}`); // Log de depuração
            throw error;
        }
    }

    async sendMediaFile(to, file, type, caption = '', filename) {
        const formattedId = this.getWhatsAppId(to);

        let resultVerifyId = await this.verifyId(formattedId);

        // Verificar se a sessão está estabelecida
        if (!this.instance.sock) {
            throw new Error('Socket instance is not initialized');
        }

        if (!resultVerifyId?.exists) {
            throw new Error('id not working or not found');
        }

        const data = await this.instance.sock?.sendMessage(
            resultVerifyId.jid,
            {
                mimetype: file.mimetype,
                [type]: file.buffer,
                caption: caption,
                ptt: type === 'audio' ? true : false,
                fileName: filename ? filename : file.originalname,
            }
        )

        return data
    }

    async sendUrlMediaFile(to, url, type, mimeType, caption = '') {
        await this.verifyId(this.getWhatsAppId(to))

        const data = await this.instance.sock?.sendMessage(
            this.getWhatsAppId(to),
            {
                [type]: {
                    url: url,
                },
                caption: caption,
                mimetype: mimeType,
            }
        )

        return data
    }

    async getProfilePictureUrl(idPhone) {
        const ppUrl = await this.instance.sock?.profilePictureUrl(
            this.getWhatsAppId(idPhone),
            'image'
        )
        return ppUrl;
    }

    async DownloadProfile(of) {
        await this.verifyId(this.getWhatsAppId(of))
        let ppUrl = this.getProfilePictureUrl(of)
        return ppUrl
    }

    async getUserStatus(of) {
        await this.verifyId(this.getWhatsAppId(of))
        const status = await this.instance.sock?.fetchStatus(
            this.getWhatsAppId(of)
        )
        return status
    }

    async blockUnblock(to, data) {
        await this.verifyId(this.getWhatsAppId(to))
        const status = await this.instance.sock?.updateBlockStatus(
            this.getWhatsAppId(to),
            data
        )
        return status
    }

    async sendButtonMessage(to, data) {
        await this.verifyId(this.getWhatsAppId(to))
        const result = await this.instance.sock?.sendMessage(
            this.getWhatsAppId(to),
            {
                templateButtons: processButton(data.buttons),
                text: data.text ?? '',
                footer: data.footerText ?? '',
                viewOnce: true,
            }
        )

        return result
    }

    async sendContactMessage(to, data) {
        await this.verifyId(this.getWhatsAppId(to))
        const vcard = generateVC(data)
        const result = await this.instance.sock?.sendMessage(
            await this.getWhatsAppId(to),
            {
                contacts: {
                    displayName: data.fullName,
                    contacts: [{ displayName: data.fullName, vcard }],
                },
            }
        )

        return result
    }

    async sendListMessage(to, data) {
        await this.verifyId(this.getWhatsAppId(to))
        const result = await this.instance.sock?.sendMessage(
            this.getWhatsAppId(to),
            {
                text: data.text,
                sections: data.sections,
                buttonText: data.buttonText,
                footer: data.description,
                title: data.title,
                viewOnce: true,
            }
        )

        return result
    }

    async sendMediaButtonMessage(to, data) {
        await this.verifyId(this.getWhatsAppId(to))

        const result = await this.instance.sock?.sendMessage(
            this.getWhatsAppId(to),
            {
                [data.mediaType]: {
                    url: data.image,
                },
                footer: data.footerText ?? '',
                caption: data.text,
                templateButtons: processButton(data.buttons),
                mimetype: data.mimeType,
                viewOnce: true,
            }
        )

        return result
    }

    async setStatus(status, to) {
        await this.verifyId(this.getWhatsAppId(to))

        const result = await this.instance.sock?.sendPresenceUpdate(status, to)
        return result
    }

    // change your display picture or a group's
    async updateProfilePicture(id, url) {
        try {
            const img = await axios.get(url, { responseType: 'arraybuffer' })
            const res = await this.instance.sock?.updateProfilePicture(
                id,
                img.data
            )
            return res
        } catch (e) {
            //console.log(e)
            return {
                error: true,
                message: 'Unable to update profile picture',
            }
        }
    }

    // get user or group object from db by id
    async getUserOrGroupById(id) {
        try {
            let Chats = await this.getChat()
            //console.log(Chats)
            const group = Chats.find((c) => c.id === this.getWhatsAppId(id))
            if (!group)
                throw new Error(
                    'unable to get group, check if the group exists'
                )
            return group
        } catch (e) {
            logger.error(e)
            logger.error('Error get group failed')
        }
    }

    // Group Methods
    parseParticipants(users) {
        return users.map((users) => this.getWhatsAppId(users))
    }

    async updateDbGroupsParticipants() {
        try {
            let groups = await this.groupFetchAllParticipating()
            let Chats = await this.getChat()
            if (groups && Chats) {
                for (const [key, value] of Object.entries(groups)) {
                    let group = Chats.find((c) => c.id === value.id)
                    if (group) {
                        let participants = []
                        for (const [
                            key_participant,
                            participant,
                        ] of Object.entries(value.participants)) {
                            participants.push(participant)
                        }
                        group.participant = participants
                        if (value.creation) {
                            group.creation = value.creation
                        }
                        if (value.subjectOwner) {
                            group.subjectOwner = value.subjectOwner
                        }
                        Chats.filter((c) => c.id === value.id)[0] = group
                    }
                }
                await this.updateDb(Chats)
            }
        } catch (e) {
            logger.error(e)
            logger.error('Error updating groups failed')
        }
    }

    async createNewGroup(name, users) {
        try {
            const group = await this.instance.sock?.groupCreate(
                name,
                users.map(this.getWhatsAppId)
            )
            return group
        } catch (e) {
            logger.error(e)
            logger.error('Error create new group failed')
        }
    }

    async addNewParticipant(id, users) {
        try {
            const res = await this.instance.sock?.groupAdd(
                this.getWhatsAppId(id),
                this.parseParticipants(users)
            )
            return res
        } catch {
            return {
                error: true,
                message:
                    'Unable to add participant, you must be an admin in this group',
            }
        }
    }

    async makeAdmin(id, users) {
        try {
            const res = await this.instance.sock?.groupMakeAdmin(
                this.getWhatsAppId(id),
                this.parseParticipants(users)
            )
            return res
        } catch {
            return {
                error: true,
                message:
                    'unable to promote some participants, check if you are admin in group or participants exists',
            }
        }
    }

    async demoteAdmin(id, users) {
        try {
            const res = await this.instance.sock?.groupDemoteAdmin(
                this.getWhatsAppId(id),
                this.parseParticipants(users)
            )
            return res
        } catch {
            return {
                error: true,
                message:
                    'unable to demote some participants, check if you are admin in group or participants exists',
            }
        }
    }

    async getAllGroups() {
        let Chats = await this.getChat()
        return Chats.filter((c) => c.id.includes('@g.us')).map((data, i) => {
            return {
                index: i,
                name: data.name,
                jid: data.id,
                participant: data.participant,
                creation: data.creation,
                subjectOwner: data.subjectOwner,
            }
        })
    }

    async leaveGroup(id) {
        try {
            let Chats = await this.getChat()
            const group = Chats.find((c) => c.id === id)
            if (!group) throw new Error('no group exists')
            return await this.instance.sock?.groupLeave(id)
        } catch (e) {
            logger.error(e)
            logger.error('Error leave group failed')
        }
    }

    async getInviteCodeGroup(id) {
        try {
            let Chats = await this.getChat()
            const group = Chats.find((c) => c.id === id)
            if (!group)
                throw new Error(
                    'unable to get invite code, check if the group exists'
                )
            return await this.instance.sock?.groupInviteCode(id)
        } catch (e) {
            logger.error(e)
            logger.error('Error get invite group failed')
        }
    }

    async getInstanceInviteCodeGroup(id) {
        try {
            return await this.instance.sock?.groupInviteCode(id)
        } catch (e) {
            logger.error(e)
            logger.error('Error get invite group failed')
        }
    }

    // get Chat object from db
    async getChat(key = this.key) {
        let dbResult = await Chat.findOne({ key: key }).exec()
        let ChatObj = dbResult.chat
        return ChatObj
    }

    // create new group by application
    async createGroupByApp(newChat) {
        try {
            let Chats = await this.getChat()
            let group = {
                id: newChat[0].id,
                name: newChat[0].subject,
                participant: newChat[0].participants,
                messages: [],
                creation: newChat[0].creation,
                subjectOwner: newChat[0].subjectOwner,
            }
            Chats.push(group)
            await this.updateDb(Chats)
        } catch (e) {
            logger.error(e)
            logger.error('Error updating document failed')
        }
    }

    async updateGroupSubjectByApp(newChat) {
        try {
            if (newChat[0] && newChat[0].subject) {
                let Chats = await this.getChat();
                //console.log(Chats);

                const chatToUpdate = Chats.find(c => c.id === newChat[0].id);

                if (chatToUpdate) {
                    chatToUpdate.name = newChat[0].subject;
                    await this.updateDb(Chats);
                } else {
                    logger.warn(`Chat with id ${newChat[0].id} not found`);
                }
            }
        } catch (e) {
            logger.error(e);
            logger.error('Error updating document failed');
        }
    }


    async updateGroupParticipantsByApp(newChat) {
        //console.log(newChat)
        try {
            if (newChat && newChat.id) {
                let Chats = await this.getChat()
                let chat = Chats.find((c) => c.id === newChat.id)
                let is_owner = false
                if (chat) {
                    if (chat.participant == undefined) {
                        chat.participant = []
                    }
                    if (chat.participant && newChat.action == 'add') {
                        for (const participant of newChat.participants) {
                            chat.participant.push({
                                id: participant,
                                admin: null,
                            })
                        }
                    }
                    if (chat.participant && newChat.action == 'remove') {
                        for (const participant of newChat.participants) {
                            // remove group if they are owner
                            if (chat.subjectOwner == participant) {
                                is_owner = true
                            }
                            chat.participant = chat.participant.filter(
                                (p) => p.id != participant
                            )
                        }
                    }
                    if (chat.participant && newChat.action == 'demote') {
                        for (const participant of newChat.participants) {
                            if (
                                chat.participant.filter(
                                    (p) => p.id == participant
                                )[0]
                            ) {
                                chat.participant.filter(
                                    (p) => p.id == participant
                                )[0].admin = null
                            }
                        }
                    }
                    if (chat.participant && newChat.action == 'promote') {
                        for (const participant of newChat.participants) {
                            if (
                                chat.participant.filter(
                                    (p) => p.id == participant
                                )[0]
                            ) {
                                chat.participant.filter(
                                    (p) => p.id == participant
                                )[0].admin = 'superadmin'
                            }
                        }
                    }
                    if (is_owner) {
                        Chats = Chats.filter((c) => c.id !== newChat.id)
                    } else {
                        Chats.filter((c) => c.id === newChat.id)[0] = chat
                    }
                    await this.updateDb(Chats)
                }
            }
        } catch (e) {
            logger.error(e)
            logger.error('Error updating document failed')
        }
    }

    async groupFetchAllParticipating() {
        try {
            const result =
                await this.instance.sock?.groupFetchAllParticipating()
            return result
        } catch (e) {
            logger.error('Error group fetch all participating failed')
        }
    }

    // update promote demote remove
    async groupParticipantsUpdate(id, users, action) {
        try {
            const res = await this.instance.sock?.groupParticipantsUpdate(
                this.getWhatsAppId(id),
                this.parseParticipants(users),
                action
            )
            return res
        } catch (e) {
            //console.log(e)
            return {
                error: true,
                message:
                    'unable to ' +
                    action +
                    ' some participants, check if you are admin in group or participants exists',
            }
        }
    }

    // update group settings like
    // only allow admins to send messages
    async groupSettingUpdate(id, action) {
        try {
            const res = await this.instance.sock?.groupSettingUpdate(
                this.getWhatsAppId(id),
                action
            )
            return res
        } catch (e) {
            //console.log(e)
            return {
                error: true,
                message:
                    'unable to ' + action + ' check if you are admin in group',
            }
        }
    }

    async groupUpdateSubject(id, subject) {
        try {
            const res = await this.instance.sock?.groupUpdateSubject(
                this.getWhatsAppId(id),
                subject
            )
            return res
        } catch (e) {
            //console.log(e)
            return {
                error: true,
                message:
                    'unable to update subject check if you are admin in group',
            }
        }
    }

    async groupUpdateDescription(id, description) {
        try {
            const res = await this.instance.sock?.groupUpdateDescription(
                this.getWhatsAppId(id),
                description
            )
            return res
        } catch (e) {
            //console.log(e)
            return {
                error: true,
                message:
                    'unable to update description check if you are admin in group',
            }
        }
    }

    // update db document -> chat
    async updateDb(object) {
        try {
            await Chat.updateOne({ key: this.key }, { chat: object })
        } catch (e) {
            logger.error('Error updating document failed')
        }
    }

    async readMessage(msgObj) {
        try {
            const key = {
                remoteJid: msgObj.remoteJid,
                id: msgObj.id,
                participant: msgObj?.participant, // required when reading a msg from group
            }
            const res = await this.instance.sock?.readMessages([key])
            return res
        } catch (e) {
            logger.error('Error read message failed')
        }
    }

    async reactMessage(id, key, emoji) {
        try {
            const reactionMessage = {
                react: {
                    text: emoji, // use an empty string to remove the reaction
                    key: key,
                },
            }
            const res = await this.instance.sock?.sendMessage(
                this.getWhatsAppId(id),
                reactionMessage
            )
            return res
        } catch (e) {
            logger.error('Error react message failed')
        }
    }

    /* contacts and group save database instance */
    async saveContactsAndGroups(arrayContactsOrGroups) {
        try {
            for (const contactGroup of arrayContactsOrGroups) {
                //console.log(contactGroup);

                if (contactGroup.id.endsWith('@g.us')) {
                    // Filtrar grupos que tenham formato "numero-traco@g.us"
                    if (/^\d+-\d+@g\.us$/.test(contactGroup.id)) {
                        continue; // pula esse grupo
                    }

                    // primeiro vamos verificar se o grupo já existe contactGroup.id na model Groups group_id
                    let alreadyThere = await Groups.findOne({ group_id: contactGroup.id }).exec();
                    if (!alreadyThere && contactGroup.name || contactGroup.subject) {
                        const saveGroup = new Groups({
                            name: contactGroup?.name ? contactGroup.name : contactGroup.subject,
                            group_id: contactGroup.id,
                            instance: this.key
                        });
                        await saveGroup.save();
                    }

                } else if (contactGroup.id.endsWith('@s.whatsapp.net')) {
                    // primeiro vamos verificar se o contato já existe contactGroup.id na model Contacts phone_id
                    let alreadyThere = await Contacts.findOne({ phone_id: contactGroup.id }).exec();
                    if (!alreadyThere && (contactGroup.name || contactGroup.notify)) {
                        const saveGroup = new Contacts({
                            name: contactGroup.name ? contactGroup.name : contactGroup.notify,
                            notify: contactGroup.notify,
                            group_id: contactGroup.id,
                            instance: this.key
                        });
                        await saveGroup.save();
                    }
                }
            }

        } catch (e) {

            logger.error('Error save contacts and groups failed')
        }
    }

}

export default WhatsAppInstance;
