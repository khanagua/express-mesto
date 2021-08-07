const User = require('../models/user');
const { ERROR_NAME, ERROR_CODE, defaultMessages } = require('../utils/errors');

const options = {
  new: true, // обработчик then получит на вход обновлённую запись
  runValidators: true, // данные будут валидированы перед изменением
  upsert: false, // если пользователь не найден, он будет создан
};

// возвращает всех пользователей
const getAllUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(() => res.status(ERROR_CODE.serverError).send(defaultMessages));
};

// возвращает пользователя по id
const getUser = (req, res) => {
  User.findById(req.params.userid)
    .orFail(new Error(ERROR_NAME.notValidId))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === ERROR_NAME.cast) {
        res.status(ERROR_CODE.badRequest).send({ message: 'Пользователь не найден' });
      }
      if (err.message === ERROR_NAME.notValidId) {
        res.status(ERROR_CODE.notFound).send({ message: 'Пользователь не найден' });
      }
      res.status(ERROR_CODE.serverError).send(defaultMessages);
    });
};

// создает пользователя
const addUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === ERROR_NAME.validation) {
        res.status(ERROR_CODE.badRequest).send({ message: 'Переданы некорректные или неполные данные пользователя' });
      }
      res.status(ERROR_CODE.serverError).send(defaultMessages);
    });
};

// обновляет профиль
const updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    options,
  )
    .orFail(new Error(ERROR_NAME.notValidId))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === ERROR_NAME.notValidId) {
        res.status(ERROR_CODE.notFound).send({ message: 'Пользователь не найден' });
      }
      switch (err.name) {
        case ERROR_NAME.validation:
          res.status(ERROR_CODE.badRequest).send({ message: 'Переданы некорректные или неполные данные' });
          break;
        case ERROR_NAME.cast:
          res.status(ERROR_CODE.badRequest).send({ message: 'Пользователь не найден' });
          break;
        default:
          res.status(ERROR_CODE.serverError).send(defaultMessages);
      }
    });
};

// обновляет аватар
const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    options,
  )
    .orFail(new Error(ERROR_NAME.notValidId))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === ERROR_NAME.notValidId) {
        res.status(ERROR_CODE.notFound).send({ message: 'Пользователь не найден' });
      }
      switch (err.name) {
        case ERROR_NAME.validation:
          res.status(ERROR_CODE.badRequest).send({ message: 'Переданы некорректные данные' });
          break;
        case ERROR_NAME.cast:
          res.status(ERROR_CODE.badRequest).send({ message: 'Пользователь не найден' });
          break;
        default:
          res.status(ERROR_CODE.serverError).send(defaultMessages);
      }
    });
};

module.exports = {
  getAllUsers,
  getUser,
  addUser,
  updateUser,
  updateAvatar,
};
