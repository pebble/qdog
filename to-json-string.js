'use strict';

module.exports = exports = toJSONString;

var toJSONStringInputError = new Error(
  'Error: Invalid Input. ' +
  'Please supply a JSON string or JSON serializable object'
);

function toJSONString(input) {
  if (input === undefined || typeof input === 'function') {
    throw toJSONStringInputError;
  }

  // test if valid JSON string
  if (typeof input === 'string') {
    try {
      // we have a valid JSON string already
      JSON.parse(input);
      return input;
    } catch (e) {
      // must be a raw string value
    }
  }

  // if we got this far then we must be dealing with either an object or a number
  try {
    return JSON.stringify(input);
  } catch (e) {
    throw toJSONStringInputError;
  }

  throw toJSONStringInputError;
}
