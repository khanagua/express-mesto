const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const { ERROR_CODE } = require('./utils/errors');

const { PORT = 3000 } = process.env;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

app.use((req, res, next) => {
  req.user = {
    _id: '610c5d776a12b919d8543d43',
  };

  next();
});

app.use('/', userRouter);
app.use('/', cardRouter);

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use('*', (req, res) => res.status(ERROR_CODE.notFound).send({ message: 'Запрашиваемый ресурс не найден' }));

app.listen(PORT);
