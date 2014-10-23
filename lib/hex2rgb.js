/** Return an array of rgb figures from a hex color
 *
 * @param {String} hexString
 * @returns {Array}
 */
module.exports = function hex2rgb(hexString) {
  return [
    parseInt(hexString.substring(0,2),16),
    parseInt(hexString.substring(2,4),16),
    parseInt(hexString.substring(4,6),16)
  ];
};
