module.exports = class ConflictRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }
};
