/*
  I feel a deeper explanation of this library may be in order. The assignment was specifically to build a custom 
  JS validation library using custom HTML attributes. I took that to mean I was not expected to use the built in validation
  options for Input elements (min, max, pattern, etc) because that would not require a separate JS library to function.

  However, I feel like this is not a very good way to run validation. For one thing, this library has no way to override the
  native validation API, so standard things that would break the input (i.e. entering an incomplete date) will still cause it
  to fail natively and bypass this library.

  If I wanted to get very deep into the issue, I could technically have set up a failure sequence where the Input is given a pattern that will 
  always fail. I could then replace the error message, force a validation check, and then replace the default parameters afterwards.
  
  That seemed needlessly complicated though, and prone to bugs.
*/

/**
 * Custom error type for validate library.
 *
 * @class ValidationError
 * @extends {Error}
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validates a number input.
 * Checks for min, max, and integer parameters as set in data tags on the input.
 *
 * @param {HTMLInputElement} element
 * @throws {ValidationError}
 */
function validateNumber(element) {
  const name = element.name ? ` (${element.name})` : "";
  const generic = `Number input error${name}:\n`
  // Check for input value
  if (element.value === "") {
    throw new ValidationError(generic + "Please enter a number");
  }
  const { min, max, integer } = element.dataset,
    val = Number(element.value);

  // Check parameters
  if (min && val < min) {
    throw new ValidationError(generic + `Value must be greater than ${min}`);
  }
  else if (max && val > max) {
    throw new ValidationError(generic + `Value must be less than ${max}`);
  }
  else if (integer && val % 1 !== 0) {
    throw new ValidationError(generic + "Value must be a whole number");
  }
}

/**
 * Basic converter for "yyyy-mm-dd" string into Date object,
 * in case the native parser gets a bit loopy.
 *
 * @param {string} dateString
 * @return {Date} 
 */
function getDateObject(dateString) {
  const [ year, month, day ] = dateString.split("-");
  return new Date(year, month - 1, day);
}

/**
 * Validates a date input.
 * Checks for min and max parameters as set in data tags on the input.
 *
 * @param {HTMLInputElement} element
 * @throws {ValidationError}
 */
function validateDate(element) {
  const name = element.name ? ` (${element.name})` : "";
  const generic = `Date input error${name}:\n`
  
  // Check for input value
  if (element.value === "") {
    throw new ValidationError(generic + "Please select a date");
  }

  const { min, max } = element.dataset;
  let minDate, minString, maxDate, maxString;
  if (min) {
    minDate = getDateObject(min);
    minString = minDate.toLocaleDateString(
      [], { year: "numeric", month: "long", day: "numeric" }
    );
  }
  if (max) {
    maxDate = getDateObject(max);
    maxString = maxDate.toLocaleDateString(
      [], { year: "numeric", month: "long", day: "numeric" }
    );
  }
  const valDate = getDateObject(element.value);

  // Check parameters
  if (minDate && valDate < minDate) {
    throw new ValidationError(generic + `Date cannot be earlier than ${minString}`)
  }
  else if (maxDate && valDate > maxDate) {
    throw new ValidationError(generic + `Date cannot be later than ${maxString}`)
  }
}


/**
 * Main function for validation library. Accepts an Input element (or an array of them) and a callback.
 * Validates the Input based on dataset attributes and runs the callback if it passes. Includes the option
 * to pass in a custom failure callback. 
 *
 * Currently only validates Number and Date inputs.
 * 
 * @param {HTMLInputElement | HTMLInputElement[]} element Element to validate. Also accepts an array of elements.
 * @param {Function} successCallback Callback to run after all checks are passed
 * @param {Function} [failureCallback] Callback to run on failure (overrides default behavior)
 * @return {*} 
 */
export default function withValidate(element, successCallback, failureCallback) {
  // Handle multiple elements entered
  if (Array.isArray(element)) {
    for (let i=0; i<element.length; i++) {
      let failed = true;
      withValidate(element[i], () => failed = false);
      if (failed) {
        return;
      }
    }
    return successCallback();
  }

  // Check element type
  if (!element instanceof HTMLInputElement) {
    throw new TypeError("Validate expects an HTMLInputElement");
  }
  try {
    switch (element.type) {
      case "number":
        validateNumber(element);
        return successCallback();
      case "date":
        validateDate(element);
        return successCallback();
      default:
        throw new Error(`
          Unsupported input type: ${element.type}.
          This is but a small library, and can only handle so much.
        `);
    }
  } catch(err) {
    if (!err instanceof ValidationError) {
      throw err;
    } else if (failureCallback) {
      return failureCallback(err);
    } else {
      window.alert(err.message);
    }
  }
}
