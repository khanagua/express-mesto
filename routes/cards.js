const { celebrate, Joi } = require('celebrate');
const cardRouter = require('express').Router();
const { method } = require('../utils/method');

const {
  getAllCards,
  addCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

cardRouter.get('/cards', getAllCards); // возвращает все карточки
cardRouter.post( // создаёт карточку
  '/cards',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      link: Joi.string().required().custom(method),
    }),
  }),
  addCard,
);
cardRouter.delete(// удаляет карточку по идентификатору
  '/cards/:cardId',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24),
    }),
  }),
  deleteCard,
);
cardRouter.put( // ставит лайк карточке
  '/cards/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24),
    }),
  }),
  likeCard,
);
cardRouter.delete( // снимает лайк с карточки
  '/cards/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24),
    }),
  }),
  dislikeCard,
);

module.exports = cardRouter;
