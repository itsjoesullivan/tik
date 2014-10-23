module.exports = function handleError(error) {
  console.log(error.status + " " + JSON.parse(error.responseText).message);
}
