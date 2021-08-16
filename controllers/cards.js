const Card = require('../models/card');
const { ERROR_NAME } = require('../errors/errors');
const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const ForbiddenError = require('../errors/forbidden-error');

// возвращает все карточки
const getAllCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch(next);
};

// создаёт карточку
const addCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === ERROR_NAME.validation) {
        next(new BadRequestError('Переданы некорректные или неполные данные карточки'));
      }
      next(err);
    });
};

// удаляет карточку по идентификатору
const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(new Error(ERROR_NAME.notValidId))
    .then((card) => {
      if (card.owner.toString() === req.user._id.toString()) {
        card.remove();
        res.status(200).send({ message: 'Карточка удалена' });
      }
      return Promise.reject(new Error(ERROR_NAME.notOwnerCard));
    })
    .catch((err) => {
      if (err.name === ERROR_NAME.cast) {
        next(new BadRequestError('Карточка не найдена'));
      }
      switch (err.message) {
        case ERROR_NAME.notValidId:
          next(new NotFoundError('Карточка не найдена'));
          break;
        case ERROR_NAME.notOwnerCard:
          next(new ForbiddenError('Нельзя удалить чужую карточку'));
          break;
        default:
          next(err);
      }
    });
};

// ставит лайк карточке
const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error(ERROR_NAME.notValidId))
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === ERROR_NAME.cast) {
        next(new BadRequestError('Карточка не найдена'));
      }
      if (err.message === ERROR_NAME.notValidId) {
        next(new NotFoundError('Карточка не найдена'));
      }
      next(err);
    });
};

// снимает лайк с карточки
const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error(ERROR_NAME.notValidId))
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === ERROR_NAME.cast) {
        next(new BadRequestError('Карточка не найдена'));
      }
      if (err.message === ERROR_NAME.notValidId) {
        next(new NotFoundError('Карточка не найдена'));
      }
      next(err);
    });
};

module.exports = {
  getAllCards,
  addCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
