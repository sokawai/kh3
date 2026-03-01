(function () {
  const captchaWidgetMap = new WeakMap();

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

  function isCaptchaEnabled(formConfig) {
    return Boolean(formConfig && formConfig.recaptchaSiteKey);
  }

  function getCaptchaToken(form) {
    if (!window.grecaptcha) {
      return "";
    }

    const widgetId = captchaWidgetMap.get(form);
    if (widgetId === undefined || widgetId === null) {
      return "";
    }

    return compactText(window.grecaptcha.getResponse(widgetId));
  }

  function renderCaptchaForForm(form, formConfig) {
    if (!isCaptchaEnabled(formConfig) || !window.grecaptcha) {
      return;
    }

    const captchaContainer = form.querySelector("[data-brevo-captcha]");
    if (!captchaContainer || captchaWidgetMap.has(form)) {
      return;
    }

    const widgetId = window.grecaptcha.render(captchaContainer, {
      sitekey: formConfig.recaptchaSiteKey
    });

    captchaWidgetMap.set(form, widgetId);
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

    if (isCaptchaEnabled(config)) {
      const captchaToken = getCaptchaToken(form);
      if (!captchaToken) {
        showStatus(form, "Please complete the captcha before submitting.", true);
        return;
      }

      payload.append("g-recaptcha-response", captchaToken);
    }

    if (config.extraFields && typeof config.extraFields === "object") {
      Object.keys(config.extraFields).forEach(function (key) {
        payload.append(key, config.extraFields[key]);
      });
    }

    setSubmittingState(form, true);
    showStatus(form, "Submitting...", false);

    try {
      // Brevo's sibforms endpoint does not set CORS headers, so use no-cors to
      // ensure the request is sent without a CORS preflight rejection.  The
      // response will be opaque (status 0, type "opaque") and cannot be
      // inspected; treat any response that arrives without a network error as
      // a successful submission.
      const response = await fetch(config.formActionUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: payload.toString()
      });

      if (response.type !== "opaque" && !response.ok) {
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

  function renderAllCaptchas() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", renderAllCaptchas, { once: true });
      return;
    }

    const config = window.BREVO_CONFIG || {};
    const allFormConfigs = toObject(config.forms);

    document.querySelectorAll("[data-brevo-form]").forEach(function (form) {
      const formKey = form.getAttribute("data-brevo-form");
      renderCaptchaForForm(form, allFormConfigs[formKey] || {});
    });
  }

  // Called by the reCAPTCHA API once it has finished loading (via the
  // onload= query parameter on the script URL).  Defined on window so the
  // reCAPTCHA loader can invoke it by name.
  window.onBrevoRecaptchaReady = renderAllCaptchas;

  document.addEventListener("DOMContentLoaded", function () {
    const config = window.BREVO_CONFIG || {};
    const allFormConfigs = toObject(config.forms);
    const forms = document.querySelectorAll("[data-brevo-form]");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const submitFormKey = form.getAttribute("data-brevo-form");
        const submitFormConfig = allFormConfigs[submitFormKey] || {};
        submitToBrevo(form, submitFormConfig);
      });
    });
  });
})();
