const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');

const { JWT_SECRET = 'secret-key' } = process.env;

module.exports.authMiddlewares = (req, res, next) => {
  // извлекаем и проверяем токен
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('Нужно пройти авторизацию'));
  }
  const token = authorization.replace('Bearer ', '');
  // верифицируем токен
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(new UnauthorizedError('Нужно пройти авторизацию'));
  }
  // payload проверенного токена отправляем в запрос
  req.user = payload;
  next();
};
