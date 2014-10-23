/* Determine whether a ticket already has a label
 *
 * @param {Object} ticket
 * @param {String} labelName
 * @returns Boolean
 *
 */
module.exports = function hasLabel(ticket, labelName) {
  return !!ticket.labels.filter(function(label) { return label.name === labelName; }).length;
}
