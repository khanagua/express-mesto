const userRouter = require('express').Router();
const {
  getAllUsers,
  getUser,
  addUser,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

userRouter.get('/users', getAllUsers); // возвращает всех пользователей
userRouter.get('/users/:userid', getUser); // возвращает пользователя по _id
userRouter.post('/users', addUser); // создаёт пользователя
userRouter.patch('/users/me', updateUser); // обновляет профиль
userRouter.patch('/users/me/avatar', updateAvatar); // обновляет аватар

module.exports = userRouter;
