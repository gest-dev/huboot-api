import InstancesModel from '../models/instances.model.js';

export default async function countSendMsg(req, res, next) {
    try {
        res.on('finish', async () => {
            // Verifica se o status da resposta é 200 ou 201
            if (res.statusCode === 200 || res.statusCode === 201) {
                const key = req.query?.key;

                if (key) {
                    const instanceDatabase = await InstancesModel.findOne({ key });
                    if (instanceDatabase) {
                        // Incrementa o contador de mensagens enviadas
                        instanceDatabase.messagesSendCount += 1;
                        await instanceDatabase.save();
                    }
                }
            }
        });

        next();
    } catch (error) {
        console.error('Erro no middleware countSendMsg:', error.message);
        next(error); // Passa o erro para o próximo middleware
    }
}
