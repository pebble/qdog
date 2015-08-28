'use strict';

module.exports = exports = toJSONString;

var toJSONStringInputError = new Error(
  'Error: Invalid Input. ' +
  'Please supply a JSON string or JSON serializable object'
);

function toJSONString(input) {
  if (input === undefined ||
      typeof input === 'function') {
    throw toJSONStringInputError;
  }

  // test if valid JSON string
  if (typeof input === 'string') {
    try {
      JSON.parse(input);

      // we have a valid JSON string already
      return input;

    } catch (e) {
      // raw string value like "hello" or "{ "
    }
  }

  try {
    return JSON.stringify(input);
  } catch (e) {
    throw toJSONStringInputError;
  }
}
