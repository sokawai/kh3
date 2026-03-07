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

  function normalizeSms(value) {
    const raw = compactText(value);
    if (!raw) {
      return "";
    }

    const digitsOnly = raw.replace(/\D+/g, "");
    if (!digitsOnly) {
      return "";
    }

    return digitsOnly;
  }

  function isValidEmail(value) {
    const email = compactText(value);
    if (!email || email.length > 254) {
      return false;
    }

    // Basic RFC-style email shape check for client-side validation.
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function isValidNanpPhone(value) {
    const digits = normalizeSms(value);
    if (digits.length === 7) {
      return true;
    }

    if (digits.length === 10) {
      return true;
    }

    return digits.length === 11 && digits.startsWith("1");
  }

  function formatPhoneForDisplay(value) {
    const digits = normalizeSms(value);
    if (digits.length === 7) {
      return digits.slice(0, 3) + "-" + digits.slice(3);
    }

    return value;
  }

  function clearFieldError(input) {
    if (!input) {
      return;
    }

    input.setCustomValidity("");
  }

  function setFieldError(input, message, shouldReport) {
    if (!input) {
      return;
    }

    input.setCustomValidity(message || "");
    if (message && shouldReport) {
      input.reportValidity();
    }
  }

  function getMaxMessageChars(formConfig) {
    const configMax = Number(formConfig && formConfig.maxMessageChars);
    return configMax > 0 ? configMax : 2000;
  }

  function getFieldErrorMessage(formConfig, input) {
    if (!input) {
      return "";
    }

    if (input.matches("input[type='email']")) {
      const emailValue = input.value ? input.value.trim() : "";
      return isValidEmail(emailValue) ? "" : "Please enter a valid email address.";
    }

    if (input.name === "phone") {
      const phoneValue = input.value ? input.value.trim() : "";
      return isValidNanpPhone(phoneValue) ? "" : "Please enter a valid phone number.";
    }

    if (input.name === "message") {
      const maxMessageChars = getMaxMessageChars(formConfig);
      const messageValue = input.value || "";
      return messageValue.length > maxMessageChars
        ? "Your inquiry is too long. Please keep it under " + maxMessageChars + " characters."
        : "";
    }

    return "";
  }

  function validateSingleField(form, formConfig, input, options) {
    const opts = toObject(options);
    const shouldReport = Boolean(opts.reportFieldErrors);
    const shouldShowStatus = opts.showStatus !== false;
    const errorMessage = getFieldErrorMessage(formConfig, input);

    if (errorMessage) {
      setFieldError(input, errorMessage, shouldReport);
      if (shouldShowStatus) {
        showStatus(form, errorMessage, true);
      }
      return false;
    }

    clearFieldError(input);
    return true;
  }

  function validateFormFields(form, formConfig, options) {
    const opts = toObject(options);
    const shouldReport = Boolean(opts.reportFieldErrors);
    const shouldShowStatus = opts.showStatus !== false;
    let firstErrorMessage = "";

    const emailInput = form.querySelector("input[type='email']");
    const phoneInput = form.querySelector("[name='phone']");
    const messageInput = form.querySelector("[name='message']");

    [emailInput, phoneInput, messageInput].forEach(function (input) {
      if (!input) {
        return;
      }

      const isValid = validateSingleField(form, formConfig, input, {
        reportFieldErrors: shouldReport,
        showStatus: false
      });

      if (!isValid && !firstErrorMessage) {
        firstErrorMessage = input.validationMessage;
      }
    });

    if (firstErrorMessage) {
      if (shouldShowStatus) {
        showStatus(form, firstErrorMessage, true);
      }
      return false;
    }

    return true;
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

    if (!submitBtn.dataset.defaultHtml) {
      submitBtn.dataset.defaultHtml = submitBtn.innerHTML;
    }

    const submittingLabel = submitBtn.getAttribute("data-submitting-label") || "Submitting...";

    submitBtn.disabled = isSubmitting;
    submitBtn.classList.toggle("opacity-70", isSubmitting);
    submitBtn.classList.toggle("cursor-not-allowed", isSubmitting);

    if (isSubmitting) {
      submitBtn.textContent = submittingLabel;
    } else if (submitBtn.dataset.defaultHtml) {
      submitBtn.innerHTML = submitBtn.dataset.defaultHtml;
    }
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

      let value = input.value ? input.value.trim() : "";

      if (String(brevoKey).toUpperCase() === "SMS") {
        value = normalizeSms(value);

        // Brevo validates SMS as a full international number. If a separate
        // country code input exists, prefix its digits when missing.
        const countryInput = form.querySelector("[name='phoneCountryCode']");
        const countryDigits = normalizeSms(countryInput ? countryInput.value : "");
        if (countryDigits && value && !value.startsWith(countryDigits)) {
          value = countryDigits + value;
        }
      }

      payload.append(brevoKey, value);
    });

    return payload;
  }

  function ensureHiddenIframe(name) {
    if (!name) {
      return null;
    }

    let iframe = document.querySelector("iframe[name='" + name + "']");
    if (iframe) {
      return iframe;
    }

    iframe = document.createElement("iframe");
    iframe.name = name;
    iframe.style.display = "none";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);
    return iframe;
  }

  function submitWithNativePost(actionUrl, payload, targetName) {
    const postForm = document.createElement("form");
    postForm.method = "POST";
    postForm.action = actionUrl;
    postForm.style.display = "none";

    if (targetName) {
      postForm.target = targetName;
    }

    payload.forEach(function (value, key) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      postForm.appendChild(input);
    });

    document.body.appendChild(postForm);
    postForm.submit();
  }

  async function submitToBrevo(form, formConfig) {
    const config = toObject(formConfig);
    if (!config.formActionUrl) {
      showStatus(form, config.errorMessage || "Add your Brevo form URL in brevo-config.js.", true);
      return;
    }

    if (!validateFormFields(form, config, { reportFieldErrors: false, showStatus: true })) {
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

    if (config.forceNativeSubmit) {
      const useIframeTarget = Boolean(config.nativeSubmitInIframe);
      const iframeName = useIframeTarget
        ? compactText(config.nativeIframeName) || "brevo-native-target"
        : "";

      if (useIframeTarget) {
        ensureHiddenIframe(iframeName);
      }

      submitWithNativePost(config.formActionUrl, payload, iframeName);

      if (useIframeTarget) {
        form.reset();
        showStatus(form, config.successMessage || "Thanks for subscribing.", false);
      }

      return;
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

  const pendingCaptchaRenders = [];

  window.brevoOnRecaptchaLoad = function () {
    pendingCaptchaRenders.forEach(function (item) {
      renderCaptchaForForm(item.form, item.formConfig);
    });
    pendingCaptchaRenders.length = 0;
  };
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
      const formKey = form.getAttribute("data-brevo-form");
      const formConfig = allFormConfigs[formKey] || {};

      if (window.grecaptcha) {
        renderCaptchaForForm(form, formConfig);
      } else {
        pendingCaptchaRenders.push({ form: form, formConfig: formConfig });
      }

      const emailInput = form.querySelector("input[type='email']");
      const phoneInput = form.querySelector("[name='phone']");
      const messageInput = form.querySelector("[name='message']");

      [emailInput, phoneInput, messageInput].forEach(function (input) {
        if (!input) {
          return;
        }

        input.addEventListener("blur", function () {
          if (input.name === "phone") {
            input.value = formatPhoneForDisplay(input.value);
          }
          validateSingleField(form, formConfig, input, { reportFieldErrors: true, showStatus: true });
        });

        input.addEventListener("input", function () {
          clearFieldError(input);
        });
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const submitFormKey = form.getAttribute("data-brevo-form");
        const submitFormConfig = allFormConfigs[submitFormKey] || {};
        submitToBrevo(form, submitFormConfig);
      });
    });
  });
})();
