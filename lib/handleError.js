module.exports = function handleError(error) {
  console.error(error.status + " " + JSON.parse(error.responseText).message);
}
