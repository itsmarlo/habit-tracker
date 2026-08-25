// Browser test contract for the contribution graph.
// Run the equivalent assertion in a browser against http://127.0.0.1:8000.
const graphDetailAssertion = (cell) => {
  if (!cell.title || !cell.getAttribute('aria-label')) {
    throw new Error('Graph cells must expose date and completion detail.');
  }
  return cell.title === cell.getAttribute('aria-label');
};

const monthLabelsAssertion = (labels) => {
  const expected = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return labels.filter(Boolean).join('|') === expected.join('|');
};

if (typeof module !== 'undefined') module.exports = { graphDetailAssertion, monthLabelsAssertion };
