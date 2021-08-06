const cardRouter = require('express').Router();
const {
  getAllCards,
  addCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

cardRouter.get('/cards', getAllCards); // возвращает все карточки
cardRouter.post('/cards', addCard); // создаёт карточку
cardRouter.delete('/cards/:cardId', deleteCard); // удаляет карточку по идентификатору
cardRouter.put('/cards/:cardId/likes', likeCard); // ставит лайк карточке
cardRouter.delete('/cards/:cardId/likes', dislikeCard); // снимает лайк с карточки

module.exports = cardRouter;
