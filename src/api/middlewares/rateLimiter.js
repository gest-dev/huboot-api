const rateLimit = require('express-rate-limit');

const throttle = (limit) => {
  return rateLimit({
    windowMs: 30000, // Tempo de bloqueio personalizado em milissegundos (1 minuto = 100000)
    max: limit, // Máximo de solicitações personalizado por minuto por IP
    handler: (req, res) => {
      res.status(429).json({ message: 'Limite de taxa excedido. Tente novamente mais tarde.' });
    },
  });

};

module.exports = throttle; 