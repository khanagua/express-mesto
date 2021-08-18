const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { celebrate, Joi, errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const { method } = require('./utils/method');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const { authMiddlewares } = require('./middlewares/authMiddlewares');
const { errorsMiddlewares } = require('./middlewares/errorsMiddlewares');
const { login, addUser } = require('./controllers/users');
const ForbiddenError = require('./errors/forbidden-error');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

const { PORT = 3000 } = process.env;
const app = express();

app.use(limiter);

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

// роуты, не требующие авторизации,
app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }), login,
);
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().custom(method),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }), addUser,
);

// авторизация
app.use(authMiddlewares);

// роуты, которым авторизация нужна
app.use('/', userRouter);
app.use('/', cardRouter);

app.use('*', (req, res, next) => next(new ForbiddenError('Нужно пройти авторизацию')));

app.use(errors());
app.use(errorsMiddlewares);

app.listen(PORT);
