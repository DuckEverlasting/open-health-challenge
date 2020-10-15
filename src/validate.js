class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateNumber(element) {
  // Check for input value
  if (element.value === "") {
    throw new ValidationError("Please enter a number");
  }
  const { min, max, integer } = element.dataset,
    val = Number(element.value);

  // Check parameters
  if (min && val < min) {
    throw new ValidationError(`Value must be greater than ${min}`);
  }
  else if (max && val > max) {
    throw new ValidationError(`Value must be less than ${max}`);
  }
  else if (integer && val % 1 !== 0) {
    throw new ValidationError("Value must be a whole number");
  }
}

function validateDate(element) {
  // Check for input value
  if (element.value === "") {
    throw new ValidationError("Please select a date");
  }

  const { min, max } = element.dataset,
    minDate = min ? new Date(min) : null,
    maxDate = max ? new Date(max) : null,
    valDate = new Date(element.value);

  // Check parameters
  if (minDate && valDate < minDate) {
    throw new ValidationError(`Date cannot be earlier than ${min}`)
  }
  else if (maxDate && valDate > maxDate) {
    throw new ValidationError(`Date cannot be later than ${max}`)
  }
}

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
        successCallback();
        break;
      case "date":
        validateDate(element);
        successCallback();
        break;
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
      failureCallback(err);
    } else {
      window.alert(err.message);
    }
  }
}
