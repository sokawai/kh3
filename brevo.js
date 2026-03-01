(function () {
  function toObject(value) {
    return value && typeof value === "object" ? value : {};
  }

  function compactText(value) {
    if (!value) {
      return "";
    }

    return String(value).replace(/\s+/g, " ").trim();
  }

  function showStatus(form, message, isError) {
    const statusEl = form.querySelector("[data-brevo-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message;
    statusEl.classList.remove("text-red-500", "text-emerald-600", "dark:text-emerald-400");

    if (isError) {
      statusEl.classList.add("text-red-500");
    } else {
      statusEl.classList.add("text-emerald-600", "dark:text-emerald-400");
    }
  }

  function setSubmittingState(form, isSubmitting) {
    const submitBtn = form.querySelector("button[type='submit']");
    if (!submitBtn) {
      return;
    }

    submitBtn.disabled = isSubmitting;
    submitBtn.classList.toggle("opacity-70", isSubmitting);
    submitBtn.classList.toggle("cursor-not-allowed", isSubmitting);
  }

  function buildPayload(form, fieldMap) {
    const payload = new URLSearchParams();
    const safeFieldMap = toObject(fieldMap);

    Object.keys(safeFieldMap).forEach(function (localKey) {
      const brevoKey = safeFieldMap[localKey];
      const input = form.querySelector("[name='" + localKey + "']");

      if (!input || !brevoKey) {
        return;
      }

      const value = input.value ? input.value.trim() : "";
      payload.append(brevoKey, value);
    });

    return payload;
  }

  async function submitToBrevo(form, formConfig) {
    const config = toObject(formConfig);
    if (!config.formActionUrl) {
      showStatus(form, "Add your Brevo form URL in brevo-config.js.", true);
      return;
    }

    const emailInput = form.querySelector("input[type='email']");
    const emailValue = emailInput ? emailInput.value.trim() : "";
    if (!emailValue) {
      showStatus(form, "Please enter a valid email address.", true);
      return;
    }

    const payload = buildPayload(form, config.fields);

    if (config.extraFields && typeof config.extraFields === "object") {
      Object.keys(config.extraFields).forEach(function (key) {
        payload.append(key, config.extraFields[key]);
      });
    }

    setSubmittingState(form, true);
    showStatus(form, "Submitting...", false);

    try {
      const response = await fetch(config.formActionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: payload.toString()
      });

      if (!response.ok) {
        let responseBody = "";

        try {
          responseBody = await response.text();
        } catch (responseReadError) {
          responseBody = "";
        }

        const compactBody = compactText(responseBody).slice(0, 180);
        const statusText = compactText(response.statusText);
        const details = [String(response.status), statusText, compactBody].filter(Boolean).join(" ");

        throw new Error(details || "brevo-request-failed");
      }

      form.reset();
      showStatus(form, config.successMessage || "Thanks for subscribing.", false);
    } catch (error) {
      const debugEnabled = Boolean(config.debugErrors);
      const detail = compactText(error && error.message);
      const fallbackMessage = config.errorMessage || "Subscription failed. Please try again.";
      const finalMessage = debugEnabled && detail ? fallbackMessage + " (" + detail + ")" : fallbackMessage;

      showStatus(form, finalMessage, true);
    } finally {
      setSubmittingState(form, false);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const config = window.BREVO_CONFIG || {};
    const allFormConfigs = toObject(config.forms);
    const forms = document.querySelectorAll("[data-brevo-form]");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const formKey = form.getAttribute("data-brevo-form");
        const formConfig = allFormConfigs[formKey] || {};
        submitToBrevo(form, formConfig);
      });
    });
  });
})();
