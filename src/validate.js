class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

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

function getDateObject(dateString) {
  const [ year, month, day ] = dateString.split("-");
  return new Date(year, month - 1, day);
}

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
