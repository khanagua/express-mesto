const { celebrate, Joi } = require('celebrate');
const userRouter = require('express').Router();
const { method } = require('../utils/method');

const {
  getAllUsers,
  getUser,
  updateUser,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

userRouter.get('/users', getAllUsers); // возвращает всех пользователей
userRouter.get('/user/me', getCurrentUser); // возвращает информацию о текущем пользователе
userRouter.get( // возвращает пользователя по _id
  '/users/:userid',
  celebrate({
    params: Joi.object().keys({
      userid: Joi.string().hex().length(24),
    }),
  }),
  getUser,
);
userRouter.patch( // обновляет профиль
  '/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(30),
    }),
  }),
  updateUser,
);
userRouter.patch( // обновляет аватар
  '/users/me/avatar', celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().required().custom(method),
    }),
  }),
  updateAvatar,
);

module.exports = userRouter;
