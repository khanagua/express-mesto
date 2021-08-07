const Card = require('../models/card');
const { ERROR_NAME, ERROR_CODE, defaultMessages } = require('../utils/errors');

// возвращает все карточки
const getAllCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch(() => res.status(ERROR_CODE.serverError).send(defaultMessages));
};

// создаёт карточку
const addCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === ERROR_NAME.validation) {
        res.status(ERROR_CODE.badRequest).send({ message: 'Переданы некорректные или неполные данные карточки' });
      }
      res.status(ERROR_CODE.serverError).send(defaultMessages);
    });
};

// удаляет карточку по идентификатору
const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error(ERROR_NAME.notValidId))
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === ERROR_NAME.cast) {
        res.status(ERROR_CODE.badRequest).send({ message: 'Карточка не найдена' });
      }
      if (err.message === ERROR_NAME.notValidId) {
        res.status(ERROR_CODE.notFound).send({ message: 'Карточка не найдена' });
      }
      res.status(ERROR_CODE.serverError).send(defaultMessages);
    });
};

// ставит лайк карточке
const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error(ERROR_NAME.notValidId))
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === ERROR_NAME.cast) {
        res.status(ERROR_CODE.badRequest).send({ message: 'Карточка не найдена' });
      }
      if (err.message === ERROR_NAME.notValidId) {
        res.status(ERROR_CODE.notFound).send({ message: 'Карточка не найдена' });
      }
      res.status(ERROR_CODE.serverError).send(defaultMessages);
    });
};

// снимает лайк с карточки
const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error(ERROR_NAME.notValidId))
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === ERROR_NAME.cast) {
        res.status(ERROR_CODE.badRequest).send({ message: 'Карточка не найдена' });
      }
      if (err.message === ERROR_NAME.notValidId) {
        res.status(ERROR_CODE.notFound).send({ message: 'Карточка не найдена' });
      }
      res.status(ERROR_CODE.serverError).send(defaultMessages);
    });
};

module.exports = {
  getAllCards,
  addCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
