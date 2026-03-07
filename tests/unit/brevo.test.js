"use strict";

/**
 * Unit tests for brevo.js pure utility functions.
 *
 * brevo.js exposes its pure helpers via a conditional module.exports
 * so they can be imported here without a DOM or browser environment.
 */

// Suppress the `document is not defined` error that the bottom of brevo.js
// triggers when it tries to attach the DOMContentLoaded listener.  jsdom
// provides `document`, so we only need to stub `tailwind` which kh-shared.js
// would otherwise require.
const brevo = require("../../brevo.js");

const {
  toObject,
  compactText,
  normalizeSms,
  isValidEmail,
  isValidNanpPhone,
  formatPhoneForDisplay,
  getMaxMessageChars,
  buildPayload,
  getFieldErrorMessage,
} = brevo;

// ---------------------------------------------------------------------------
// toObject
// ---------------------------------------------------------------------------
describe("toObject", () => {
  test("returns the value unchanged when it is already a plain object", () => {
    const obj = { a: 1 };
    expect(toObject(obj)).toBe(obj);
  });

  test("returns an empty object for null", () => {
    expect(toObject(null)).toEqual({});
  });

  test("returns an empty object for undefined", () => {
    expect(toObject(undefined)).toEqual({});
  });

  test("returns an empty object for a string", () => {
    expect(toObject("hello")).toEqual({});
  });

  test("returns an empty object for a number", () => {
    expect(toObject(42)).toEqual({});
  });

  test("returns an array unchanged (arrays are objects)", () => {
    const arr = [1, 2, 3];
    expect(toObject(arr)).toBe(arr);
  });
});

// ---------------------------------------------------------------------------
// compactText
// ---------------------------------------------------------------------------
describe("compactText", () => {
  test("trims leading and trailing whitespace", () => {
    expect(compactText("  hello  ")).toBe("hello");
  });

  test("collapses multiple spaces into one", () => {
    expect(compactText("a   b")).toBe("a b");
  });

  test("collapses newlines and tabs", () => {
    expect(compactText("a\n\t b")).toBe("a b");
  });

  test("returns empty string for null", () => {
    expect(compactText(null)).toBe("");
  });

  test("returns empty string for undefined", () => {
    expect(compactText(undefined)).toBe("");
  });

  test("returns empty string for empty string", () => {
    expect(compactText("")).toBe("");
  });

  test("converts numbers to strings", () => {
    expect(compactText(123)).toBe("123");
  });
});

// ---------------------------------------------------------------------------
// normalizeSms
// ---------------------------------------------------------------------------
describe("normalizeSms", () => {
  test("strips all non-digit characters", () => {
    expect(normalizeSms("+1 (416) 555-0123")).toBe("14165550123");
  });

  test("returns empty string for an empty value", () => {
    expect(normalizeSms("")).toBe("");
  });

  test("returns empty string for a string with no digits", () => {
    expect(normalizeSms("abc---")).toBe("");
  });

  test("preserves plain digit strings", () => {
    expect(normalizeSms("4165550123")).toBe("4165550123");
  });
});

// ---------------------------------------------------------------------------
// isValidEmail
// ---------------------------------------------------------------------------
describe("isValidEmail", () => {
  test("accepts a standard email address", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  test("accepts subdomains", () => {
    expect(isValidEmail("user@mail.example.co.uk")).toBe(true);
  });

  test("rejects a string missing '@'", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  test("rejects a string missing a domain extension", () => {
    expect(isValidEmail("user@example")).toBe(false);
  });

  test("rejects an empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  test("rejects null", () => {
    expect(isValidEmail(null)).toBe(false);
  });

  test("rejects an address that is longer than 254 characters", () => {
    const longEmail = "a".repeat(249) + "@b.com"; // 249 + 6 = 255 chars
    expect(longEmail.length).toBeGreaterThan(254);
    expect(isValidEmail(longEmail)).toBe(false);
  });

  test("trims surrounding whitespace before validating", () => {
    expect(isValidEmail("  user@example.com  ")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isValidNanpPhone
// ---------------------------------------------------------------------------
describe("isValidNanpPhone", () => {
  test("accepts a 7-digit local number", () => {
    expect(isValidNanpPhone("5550123")).toBe(true);
  });

  test("accepts a 10-digit NANP number", () => {
    expect(isValidNanpPhone("4165550123")).toBe(true);
  });

  test("accepts a formatted 10-digit number", () => {
    expect(isValidNanpPhone("(416) 555-0123")).toBe(true);
  });

  test("accepts an 11-digit number starting with 1", () => {
    expect(isValidNanpPhone("14165550123")).toBe(true);
  });

  test("accepts a formatted 11-digit number starting with +1", () => {
    expect(isValidNanpPhone("+1 (416) 555-0123")).toBe(true);
  });

  test("rejects an 8-digit number", () => {
    expect(isValidNanpPhone("55501234")).toBe(false);
  });

  test("rejects a 9-digit number", () => {
    expect(isValidNanpPhone("416555012")).toBe(false);
  });

  test("rejects an empty string", () => {
    expect(isValidNanpPhone("")).toBe(false);
  });

  test("rejects a string with no digits", () => {
    expect(isValidNanpPhone("abc")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// formatPhoneForDisplay
// ---------------------------------------------------------------------------
describe("formatPhoneForDisplay", () => {
  test("formats a 7-digit number as XXX-XXXX", () => {
    expect(formatPhoneForDisplay("5550123")).toBe("555-0123");
  });

  test("returns non-7-digit input unchanged", () => {
    expect(formatPhoneForDisplay("4165550123")).toBe("4165550123");
  });

  test("returns a formatted string unchanged when digit count is not 7", () => {
    expect(formatPhoneForDisplay("(416) 555-0123")).toBe("(416) 555-0123");
  });
});

// ---------------------------------------------------------------------------
// getMaxMessageChars
// ---------------------------------------------------------------------------
describe("getMaxMessageChars", () => {
  test("returns the configured limit when it is a positive number", () => {
    expect(getMaxMessageChars({ maxMessageChars: 500 })).toBe(500);
  });

  test("falls back to 2000 when maxMessageChars is 0", () => {
    expect(getMaxMessageChars({ maxMessageChars: 0 })).toBe(2000);
  });

  test("falls back to 2000 when maxMessageChars is negative", () => {
    expect(getMaxMessageChars({ maxMessageChars: -1 })).toBe(2000);
  });

  test("falls back to 2000 when no config is provided", () => {
    expect(getMaxMessageChars(null)).toBe(2000);
  });

  test("falls back to 2000 when maxMessageChars is not a number", () => {
    expect(getMaxMessageChars({ maxMessageChars: "many" })).toBe(2000);
  });
});

// ---------------------------------------------------------------------------
// buildPayload
// ---------------------------------------------------------------------------
describe("buildPayload", () => {
  function makeForm(fields) {
    document.body.innerHTML = Object.entries(fields)
      .map(
        ([name, value]) =>
          `<input name="${name}" value="${value}" />`
      )
      .join("");
    return document.body;
  }

  test("maps local field names to Brevo keys", () => {
    const form = makeForm({ email: "test@example.com" });
    const payload = buildPayload(form, { email: "EMAIL" });
    expect(payload.get("EMAIL")).toBe("test@example.com");
  });

  test("normalises SMS values to digits only", () => {
    const form = makeForm({ phone: "(416) 555-0123" });
    const payload = buildPayload(form, { phone: "SMS" });
    expect(payload.get("SMS")).toBe("4165550123");
  });

  test("ignores field map entries that have no matching input", () => {
    const form = makeForm({ email: "a@b.com" });
    const payload = buildPayload(form, { email: "EMAIL", ghost: "GHOST" });
    expect(payload.has("GHOST")).toBe(false);
  });

  test("returns an empty URLSearchParams when fieldMap is empty", () => {
    const form = makeForm({ email: "a@b.com" });
    const payload = buildPayload(form, {});
    expect([...payload.entries()]).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getFieldErrorMessage
// ---------------------------------------------------------------------------
describe("getFieldErrorMessage", () => {
  function makeInput(attributes) {
    const input = document.createElement("input");
    Object.entries(attributes).forEach(([k, v]) => {
      if (k === "value") {
        input.value = v;
      } else {
        input.setAttribute(k, v);
      }
    });
    return input;
  }

  test("returns an error for an invalid email", () => {
    const input = makeInput({ type: "email", value: "not-an-email" });
    expect(getFieldErrorMessage({}, input)).not.toBe("");
  });

  test("returns empty string for a valid email", () => {
    const input = makeInput({ type: "email", value: "user@example.com" });
    expect(getFieldErrorMessage({}, input)).toBe("");
  });

  test("returns an error for an invalid phone", () => {
    const input = makeInput({ name: "phone", value: "123" });
    expect(getFieldErrorMessage({}, input)).not.toBe("");
  });

  test("returns empty string for a valid phone", () => {
    const input = makeInput({ name: "phone", value: "4165550123" });
    expect(getFieldErrorMessage({}, input)).toBe("");
  });

  test("returns an error when message exceeds maxMessageChars", () => {
    const input = makeInput({ name: "message", value: "x".repeat(2001) });
    expect(getFieldErrorMessage({}, input)).not.toBe("");
  });

  test("returns empty string when message is within limit", () => {
    const input = makeInput({ name: "message", value: "Hello" });
    expect(getFieldErrorMessage({}, input)).toBe("");
  });

  test("returns empty string for an unrelated input", () => {
    const input = makeInput({ name: "firstName", value: "Alice" });
    expect(getFieldErrorMessage({}, input)).toBe("");
  });

  test("returns empty string for a null input", () => {
    expect(getFieldErrorMessage({}, null)).toBe("");
  });
});
