import { proto } from '@whiskeysockets/baileys';
import { Curve, signedKeyPair } from '@whiskeysockets/baileys/lib/Utils/crypto.js';
import { generateRegistrationId } from '@whiskeysockets/baileys/lib/Utils/generics.js';
import { randomBytes } from 'crypto';

const initAuthCreds = () => {
    const identityKey = Curve.generateKeyPair()
    return {
        noiseKey: Curve.generateKeyPair(),
        signedIdentityKey: identityKey,
        signedPreKey: signedKeyPair(identityKey, 1),
        registrationId: generateRegistrationId(),
        advSecretKey: randomBytes(32).toString('base64'),
        processedHistoryMessages: [],
        nextPreKeyId: 1,
        firstUnuploadedPreKeyId: 1,
        accountSettings: {
            unarchiveChats: false,
        },
        // Campos adicionais para evitar erros
        accountSyncCounter: 0,
        me: null,
        platform: null,
    }
}

const BufferJSON = {
    replacer: (k, value) => {
        if (
            Buffer.isBuffer(value) ||
            value instanceof Uint8Array ||
            value?.type === 'Buffer'
        ) {
            return {
                type: 'Buffer',
                data: Buffer.from(value?.data || value).toString('base64'),
            }
        }

        // Handle Uint8Array and similar types
        if (value && typeof value === 'object' && value.byteLength !== undefined) {
            return {
                type: 'Buffer',
                data: Buffer.from(value).toString('base64')
            };
        }

        return value
    },

    reviver: (k, value) => {
        if (
            typeof value === 'object' &&
            !!value &&
            (value.buffer === true || value.type === 'Buffer')
        ) {
            const val = value.data || value.value
            return typeof val === 'string'
                ? Buffer.from(val, 'base64')
                : Buffer.from(val || [])
        } else if ((k === 'seed' || k === 'public' || k === 'private') && typeof value === 'string') {
            return Buffer.from(value, 'base64');
        }
        return value
    },
}

// Função corrigida para converter objetos em arrays
function convertObjectToArray(obj) {
    if (!obj || typeof obj !== 'object') {
        console.warn('convertObjectToArray: Invalid object received', obj);
        return [];
    }

    // Se já for um array, retorna como está
    if (Array.isArray(obj)) {
        return obj;
    }

    // Se for um objeto com propriedades numéricas, converte para array
    if (Object.keys(obj).some(key => !isNaN(key))) {
        const result = [];
        for (let i = 0; i < Object.keys(obj).length; i++) {
            if (obj[i] !== undefined) {
                result.push(obj[i]);
            }
        }
        return result;
    }

    // Se for um objeto único, coloca em um array
    return [obj];
}

// Função para normalizar dados de sender-key
function normalizeSenderKeyData(value) {
    if (!value) return value;

    // Se já for um array, verifica se precisa normalizar os itens
    if (Array.isArray(value)) {
        return value.map(item => {
            if (item && typeof item === 'object') {
                // Garante que senderMessageKeys seja um array válido
                if (item.senderMessageKeys && !Array.isArray(item.senderMessageKeys)) {
                    item.senderMessageKeys = [];
                }
                // Garante que senderChainKey seja um objeto válido
                if (item.senderChainKey && typeof item.senderChainKey !== 'object') {
                    item.senderChainKey = {};
                }
                // Garante que senderSigningKey seja um objeto válido
                if (item.senderSigningKey && typeof item.senderSigningKey !== 'object') {
                    item.senderSigningKey = {};
                }
            }
            return item;
        });
    }

    // Se for um objeto, converte para array
    if (typeof value === 'object') {
        const arrayValue = convertObjectToArray(value);
        return normalizeSenderKeyData(arrayValue);
    }

    return value;
}

// Função para criar AppStateSyncKeyData corretamente
function createAppStateSyncKeyData(obj) {
    if (!obj) return null;

    try {
        // Tenta criar usando a estrutura correta do proto
        if (proto.AppStateSyncKeyData) {
            return proto.AppStateSyncKeyData.create(obj);
        } else if (proto.message && proto.message.AppStateSyncKeyData) {
            return proto.message.AppStateSyncKeyData.create(obj);
        } else {
            // Fallback: retorna o objeto como está se não encontrar a estrutura correta
            console.warn('AppStateSyncKeyData structure not found, returning raw object');
            return obj;
        }
    } catch (error) {
        console.warn('Error creating AppStateSyncKeyData:', error);
        return obj; // Retorna o objeto original em caso de erro
    }
}

const useMongoDBAuthState = async (collection) => {
    console.log('Initializing MongoDB auth state for collection:', collection.collectionName);

    const writeData = async (data, id) => {
        try {
            if (!data) {
                console.warn(`Attempted to write null/undefined data for id: ${id}`);
                return;
            }

            // Converte arrays para objetos para armazenamento no MongoDB
            let dataToStore = data;
            if (Array.isArray(data)) {
                dataToStore = {};
                data.forEach((item, index) => {
                    dataToStore[index] = item;
                });
            }

            const result = await collection.replaceOne(
                { _id: id },
                {
                    _id: id,
                    data: JSON.parse(JSON.stringify(dataToStore, BufferJSON.replacer)),
                    updatedAt: new Date(),
                    timestamp: Date.now()
                },
                { upsert: true }
            );

            //console.log(`Data written successfully for id: ${id}, modifiedCount: ${result.modifiedCount}`);
        } catch (error) {
            console.error('Error writing data to MongoDB:', error);
            throw error;
        }
    };

    const readData = async (id) => {
        try {
            const result = await collection.findOne({ _id: id });
            if (!result || !result.data) {
                console.log(`No data found for id: ${id}`);
                return null;
            }

            const parsed = JSON.parse(JSON.stringify(result.data), BufferJSON.reviver);

            // Converte objetos de volta para arrays quando necessário
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                // Verifica se é um objeto que deveria ser um array (tem propriedades numéricas)
                const keys = Object.keys(parsed);
                if (keys.length > 0 && keys.every(key => !isNaN(key))) {
                    const arrayResult = [];
                    for (let i = 0; i < keys.length; i++) {
                        if (parsed[i] !== undefined) {
                            arrayResult.push(parsed[i]);
                        }
                    }
                    return arrayResult;
                }
            }

            return parsed;
        } catch (error) {
            console.error(`Error reading data for id ${id}:`, error);
            return null;
        }
    };

    const removeData = async (id) => {
        try {
            await collection.deleteOne({ _id: id });
            console.log(`Data removed for id: ${id}`);
        } catch (error) {
            console.error(`Error removing data for id ${id}:`, error);
        }
    };

    // Initialize or load credentials
    let creds = await readData('creds');
    if (!creds) {
        console.log('No existing credentials found, initializing new ones...');
        creds = initAuthCreds();
        await writeData(creds, 'creds');
    } else {
        console.log('Loaded existing credentials from MongoDB');

        // Garante que campos obrigatórios existam
        if (!creds.noiseKey) creds.noiseKey = Curve.generateKeyPair();
        if (!creds.signedIdentityKey) creds.signedIdentityKey = Curve.generateKeyPair();
        if (!creds.registrationId) creds.registrationId = generateRegistrationId();
        if (!creds.processedHistoryMessages) creds.processedHistoryMessages = [];
        if (!creds.accountSyncCounter) creds.accountSyncCounter = 0;
    }

    const saveCreds = async () => {
        if (creds) {
            console.log('Saving credentials to MongoDB...');
            await writeData(creds, 'creds');
        }
    };

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            try {
                                let value = await readData(`${type}-${id}`);

                                // Normaliza dados de sender-key
                                if (type === 'sender-key' && value) {
                                    value = normalizeSenderKeyData(value);
                                }

                                // Converte para protobuf quando necessário - CORREÇÃO AQUI
                                if (type === 'app-state-sync-key' && value) {
                                    try {
                                        value = createAppStateSyncKeyData(value);
                                    } catch (error) {
                                        console.warn('Error creating AppStateSyncKeyData:', error);
                                        // Mantém o valor original em caso de erro
                                    }
                                }

                                data[id] = value;
                            } catch (error) {
                                console.error(`Error getting key ${type}-${id}:`, error);
                                data[id] = null;
                            }
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    try {
                        const tasks = [];
                        for (const category in data) {
                            if (data.hasOwnProperty(category)) {
                                for (const id in data[category]) {
                                    if (data[category].hasOwnProperty(id)) {
                                        const value = data[category][id];
                                        const key = `${category}-${id}`;

                                        // Normaliza dados de sender-key antes de salvar
                                        let valueToStore = value;
                                        if (category === 'sender-key' && value) {
                                            valueToStore = normalizeSenderKeyData(value);
                                        }

                                        // Para app-state-sync-key, extrai o objeto se for um protobuf
                                        if (category === 'app-state-sync-key' && value && typeof value === 'object') {
                                            // Se for um objeto protobuf, converte para objeto simples
                                            if (value.toJSON) {
                                                valueToStore = value.toJSON();
                                            }
                                        }

                                        if (valueToStore) {
                                            tasks.push(writeData(valueToStore, key));
                                        } else {
                                            tasks.push(removeData(key));
                                        }
                                    }
                                }
                            }
                        }
                        await Promise.all(tasks);
                    } catch (error) {
                        console.error('Error in keys.set:', error);
                    }
                },
            },
        },
        saveCreds,
    };
};

export default useMongoDBAuthState;