module.exports = function (plasma, config) {
  this.message = function (data) {
    config.messaged(data);
  };
}