import rateLimit from 'express-rate-limit';

const throttle = (limit) => {
  return rateLimit({
    windowMs: 30000, // Tempo de bloqueio em milissegundos (30s)
    max: limit, // Máximo de solicitações por IP
    handler: (req, res) => {
      console.log('[RATE LIMIT - BLOCKED]', {
        ip: req.ip,
        cf: req.headers['cf-connecting-ip'],
        xff: req.headers['x-forwarded-for']
      });
      res.status(429).json({ message: 'Limite de taxa excedido. Tente novamente mais tarde.' });
    },
  });
};

export default throttle;
