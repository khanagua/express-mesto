const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { ERROR_NAME } = require('../errors/errors');
const BadRequestError = require('../errors/bad-request-error');
const ConflictRequestError = require('../errors/conflict-request-error');
const NotFoundError = require('../errors/not-found-error');
const UnauthorizedError = require('../errors/unauthorized-error');

const options = {
  new: true, // обработчик then получит на вход обновлённую запись
  runValidators: true, // данные будут валидированы перед изменением
  upsert: false, // если пользователь не найден, он будет создан
};

// возвращает всех пользователей
const getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
};

// возвращает пользователя по id
const getUser = (req, res, next) => {
  User.findById(req.params.userid)
    .orFail(new Error(ERROR_NAME.notValidId))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === ERROR_NAME.cast) {
        next(new BadRequestError('Пользователь не найден'));
      }
      if (err.message === ERROR_NAME.notValidId) {
        next(new NotFoundError('Пользователь не найден'));
      }
      next(err);
    });
};

// создает пользователя
const addUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.status(200).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === ERROR_NAME.validation) {
        next(new BadRequestError('Переданы некорректные или неполные данные пользователя'));
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        next(new ConflictRequestError('Пользователь с такой почтой уже существует'));
      }
      next(err);
    });
};

// обновляет профиль
const updateUser = (req, res, next) => {
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
        next(new NotFoundError('Пользователь не найден'));
      }
      switch (err.name) {
        case ERROR_NAME.validation:
          next(new BadRequestError('Переданы некорректные или неполные данные'));
          break;
        case ERROR_NAME.cast:
          next(new BadRequestError('Пользователь не найден'));
          break;
        default:
          next(err);
      }
    });
};

// обновляет аватар
const updateAvatar = (req, res, next) => {
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
        next(new NotFoundError('Пользователь не найден'));
      }
      switch (err.name) {
        case ERROR_NAME.validation:
          next(new BadRequestError('Переданы некорректные данные'));
          break;
        case ERROR_NAME.cast:
          next(new BadRequestError('Пользователь не найден'));
          break;
        default:
          next(err);
      }
    });
};

// авторизация пользователя
const login = (req, res, next) => {
  const { email, password } = req.body;
  const { JWT_SECRET = 'secret-key' } = process.env;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        JWT_SECRET,
        { expiresIn: '7d' },
      );
      res.status(200).send({ token });
    })
    .catch((err) => {
      if (err.message === 'IncorrectData') {
        next(new UnauthorizedError('Неправильная почта или пароль'));
      }
      next(err);
    });
};

// возвращает информацию о текущем пользователе
const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === ERROR_NAME.cast) {
        next(new BadRequestError('Пользователь не найден'));
      }
      next(err);
    });
};

module.exports = {
  getAllUsers,
  getUser,
  addUser,
  updateUser,
  updateAvatar,
  login,
  getCurrentUser,
};
