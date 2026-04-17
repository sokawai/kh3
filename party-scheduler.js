/* ============================================================
   Kencha House — Party Booking Scheduler
   party-scheduler.js

   OWNER CONFIGURATION — Edit the KH_PARTY_CONFIG block below
   to update packages, available time slots, blocked dates, and
   messaging without touching any other code.
   ============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────────────────────
     GOOGLE APPS SCRIPT BOOKING ENDPOINT
     ──────────────────────────────────────────────────────────────────────── */
  var GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwcp26H19jQ3hlGUdwMA--BBo79uPNoB603Yg5h8lcKDYNKNq2XSiLBk3z5I_fntC8P0w/exec';

  /* ──────────────────────────────────────────────────────────────────────────
     OWNER-EDITABLE CONFIGURATION
     ──────────────────────────────────────────────────────────────────────── */
  window.KH_PARTY_CONFIG = {

    packages: [
      {
        id: 'private-rental',
        name: 'Private Rental',
        icon: '🏠',
        duration: '2 hours',
        capacity: 'Up to 10 guests',
        price: 'From $250',
        includes: [
          'Exclusive use of the space',
          'Nespresso coffee & tea for parents',
          'Bring your own catering',
          'Full A/V system access',
          'Curated baby play area & toys'
        ]
      },
      {
        id: 'birthday-celebration',
        name: 'Birthday Celebration',
        icon: '🎉',
        duration: '2.5 hours',
        capacity: 'Up to 15 guests',
        price: 'From $350',
        includes: [
          'Exclusive use of the space',
          'Nespresso coffee & tea',
          'Birthday décor setup',
          'A/V system access',
          'Optional add-ons available'
        ]
      },
      {
        id: 'custom-event',
        name: 'Custom Event',
        icon: '✨',
        duration: 'Flexible',
        capacity: 'By arrangement',
        price: 'Contact us',
        includes: [
          'Baby showers & meetups',
          'Special celebrations',
          'Custom arrangements',
          'Tailored to your needs'
        ]
      }
    ],

    // Available time slots shown to customers
    timeSlots: ['10:00 AM', '1:00 PM', '4:00 PM'],

    // Block specific dates (YYYY-MM-DD format).
    // Example: blockedDates: ['2026-12-25', '2026-12-26'],
    blockedDates: [],

    // How many days in advance a booking can be made (prevents same-day bookings)
    minLeadDays: 2,

    // Shown in step 4 "About Your Booking" callout (editable)
    bookingIncludes: 'Enjoy exclusive use of our cozy baby play space. Your rental includes up to 10 guests (including adults and kids), Nespresso coffee and tea, and space to bring your own catering.',

    // Payment instructions shown at step 4 and on the thank-you screen
    paymentInstructions: 'To secure your booking, please send an Interac e-Transfer to kenchahouse@gmail.com within 24 hours. A final confirmation will be sent once payment is received.'
  };

  /* ──────────────────────────────────────────────────────────────────────────
     INTERNAL STATE
     ──────────────────────────────────────────────────────────────────────── */
  var state = {
    currentStep: 1,
    selectedPackage: null,
    selectedDate: null,
    selectedTime: null,
    calYear: null,
    calMonth: null
  };

  var MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /* ──────────────────────────────────────────────────────────────────────────
     INITIALIZATION
     ──────────────────────────────────────────────────────────────────────── */
  function init() {
    if (!document.getElementById('kh-booking-wizard')) { return; }

    var now = new Date();
    state.calYear = now.getFullYear();
    state.calMonth = now.getMonth();

    renderPackages();
    renderCalendar();
    renderTimeSlots();
    populateConfigText();
    updateStepIndicator(1);

    var form = document.getElementById('kh-party-form');
    if (form) { form.addEventListener('submit', handleFormSubmit); }
  }

  function populateConfigText() {
    var cfg = window.KH_PARTY_CONFIG || {};
    var ids = {
      'kh-booking-includes': cfg.bookingIncludes,
      'kh-payment-instructions': cfg.paymentInstructions,
      'kh-thankyou-payment': cfg.paymentInstructions
    };
    Object.keys(ids).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && ids[id]) { el.textContent = ids[id]; }
    });
  }

  /* ──────────────────────────────────────────────────────────────────────────
     STEP NAVIGATION
     ──────────────────────────────────────────────────────────────────────── */
  function goToStep(targetStep) {
    if (targetStep === 2 && !state.selectedPackage) {
      shakeStep('kh-step-1');
      return;
    }
    if (targetStep === 3 && !state.selectedDate) {
      shakeStep('kh-step-2');
      return;
    }
    if (targetStep === 4 && !state.selectedTime) {
      shakeStep('kh-step-3');
      return;
    }

    if (targetStep === 4) {
      buildBookingSummary();
      prefillMessageField();
    }

    for (var s = 1; s <= 4; s++) {
      var el = document.getElementById('kh-step-' + s);
      if (!el) { continue; }
      if (s === targetStep) {
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', '');
      }
    }

    state.currentStep = targetStep;
    updateStepIndicator(targetStep);
    scrollToSection();
  }

  function shakeStep(stepId) {
    var el = document.getElementById(stepId);
    if (!el) { return; }
    el.classList.add('kh-shake');
    setTimeout(function () { el.classList.remove('kh-shake'); }, 600);

    var hint = el.querySelector('.kh-step-hint');
    if (hint) {
      hint.removeAttribute('hidden');
      setTimeout(function () { hint.setAttribute('hidden', ''); }, 3000);
    }
  }

  function updateStepIndicator(active) {
    for (var i = 1; i <= 4; i++) {
      var dot = document.getElementById('kh-indicator-' + i);
      if (!dot) { continue; }
      dot.className = 'kh-step-dot';
      if (i < active) { dot.className += ' done'; }
      else if (i === active) { dot.className += ' active'; }
    }
  }

  function scrollToSection() {
    var section = document.getElementById('book');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
     STEP 1 — PACKAGE SELECTION
     ──────────────────────────────────────────────────────────────────────── */
  function renderPackages() {
    var container = document.getElementById('kh-packages-grid');
    if (!container) { return; }

    var cfg = window.KH_PARTY_CONFIG || {};
    var pkgs = cfg.packages || [];

    container.innerHTML = pkgs.map(function (pkg) {
      var glyph = pkg.icon || '🎉';
      return [
        '<button type="button" class="kh-pkg-card" data-pkg-id="' + pkg.id + '"',
        ' aria-label="Select ' + pkg.name + '"',
        ' onclick="khWizard.selectPackage(\'' + pkg.id + '\')">',
        '<div class="kh-pkg-header">',
        '<span class="kh-pkg-icon" aria-hidden="true">' + glyph + '</span>',
        '<span class="kh-pkg-check" hidden aria-hidden="true">&#10003;</span>',
        '</div>',
        '<h3 class="kh-pkg-name">' + pkg.name + '</h3>',
        '<p class="kh-pkg-meta">' + pkg.duration + ' &nbsp;·&nbsp; ' + pkg.capacity + '</p>',
        '<p class="kh-pkg-price">' + pkg.price + '</p>',
        '<ul class="kh-pkg-includes">',
        (pkg.includes || []).map(function (item) {
          return '<li><span aria-hidden="true">&#10003;</span>' + item + '</li>';
        }).join(''),
        '</ul>',
        '</button>'
      ].join('');
    }).join('');
  }

  function selectPackage(pkgId) {
    state.selectedPackage = pkgId;
    document.querySelectorAll('.kh-pkg-card').forEach(function (card) {
      var check = card.querySelector('.kh-pkg-check');
      if (card.dataset.pkgId === pkgId) {
        card.classList.add('selected');
        if (check) { check.removeAttribute('hidden'); }
      } else {
        card.classList.remove('selected');
        if (check) { check.setAttribute('hidden', ''); }
      }
    });
    setTimeout(function () { goToStep(2); }, 420);
  }

  /* ──────────────────────────────────────────────────────────────────────────
     STEP 2 — DATE SELECTION (CALENDAR)
     ──────────────────────────────────────────────────────────────────────── */
  function renderCalendar() {
    var container = document.getElementById('kh-calendar');
    if (!container) { return; }

    var year = state.calYear;
    var month = state.calMonth;
    var cfg = window.KH_PARTY_CONFIG || {};
    var blocked = cfg.blockedDates || [];
    var leadDays = typeof cfg.minLeadDays === 'number' ? cfg.minLeadDays : 2;

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var minDate = new Date(today);
    minDate.setDate(today.getDate() + leadDays);

    var firstDayOfWeek = new Date(year, month, 1).getDay();
    var totalDays = new Date(year, month + 1, 0).getDate();
    var prevMonthDays = new Date(year, month, 0).getDate();

    var isAtMin = (year === today.getFullYear() && month === today.getMonth());

    var html = '';
    html += '<div class="kh-cal-header">';
    html += '<button type="button" class="kh-cal-nav-btn" onclick="khWizard.calPrev()"' +
      (isAtMin ? ' disabled aria-disabled="true"' : '') +
      ' aria-label="Previous month">&#8249;</button>';
    html += '<span class="kh-cal-month-label">' + MONTH_NAMES[month] + ' ' + year + '</span>';
    html += '<button type="button" class="kh-cal-nav-btn" onclick="khWizard.calNext()" aria-label="Next month">&#8250;</button>';
    html += '</div>';

    html += '<div class="kh-cal-grid" role="grid" aria-label="' + MONTH_NAMES[month] + ' ' + year + '">';

    DAY_NAMES.forEach(function (d) {
      html += '<div class="kh-cal-label" role="columnheader">' + d + '</div>';
    });

    for (var e = 0; e < firstDayOfWeek; e++) {
      html += '<div class="kh-cal-cell kh-cal-other">' + (prevMonthDays - firstDayOfWeek + 1 + e) + '</div>';
    }

    for (var d = 1; d <= totalDays; d++) {
      var cellDate = new Date(year, month, d);
      cellDate.setHours(0, 0, 0, 0);
      var dateStr = year + '-' + pad(month + 1) + '-' + pad(d);
      var isPast = cellDate < minDate;
      var isBlocked = blocked.indexOf(dateStr) !== -1;
      var isToday = cellDate.getTime() === today.getTime();
      var isSel = state.selectedDate === dateStr;
      var isDisabled = isPast || isBlocked;

      var cls = 'kh-cal-cell';
      if (isDisabled) { cls += ' disabled'; }
      else { cls += ' available'; }
      if (isToday) { cls += ' today'; }
      if (isSel) { cls += ' selected'; }

      if (!isDisabled) {
        html += '<button type="button" class="' + cls + '" data-date="' + dateStr + '"' +
          ' onclick="khWizard.selectDate(\'' + dateStr + '\')"' +
          ' aria-label="' + MONTH_NAMES[month] + ' ' + d + ', ' + year + '">' + d + '</button>';
      } else {
        html += '<div class="' + cls + '" aria-disabled="true">' + d + '</div>';
      }
    }

    var usedCells = firstDayOfWeek + totalDays;
    var trailingCells = (Math.ceil(usedCells / 7) * 7) - usedCells;
    for (var t = 1; t <= trailingCells; t++) {
      html += '<div class="kh-cal-cell kh-cal-other">' + t + '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function calPrev() {
    if (state.calMonth === 0) {
      state.calMonth = 11;
      state.calYear--;
    } else {
      state.calMonth--;
    }
    renderCalendar();
  }

  function calNext() {
    if (state.calMonth === 11) {
      state.calMonth = 0;
      state.calYear++;
    } else {
      state.calMonth++;
    }
    renderCalendar();
  }

  function selectDate(dateStr) {
    state.selectedDate = dateStr;
    renderCalendar();
    setTimeout(function () { goToStep(3); }, 380);
  }

  /* ──────────────────────────────────────────────────────────────────────────
     STEP 3 — TIME SLOT SELECTION
     ──────────────────────────────────────────────────────────────────────── */
  function renderTimeSlots() {
    var container = document.getElementById('kh-time-slots');
    if (!container) { return; }

    var cfg = window.KH_PARTY_CONFIG || {};
    var slots = cfg.timeSlots || [];

    container.innerHTML = slots.map(function (slot) {
      return [
        '<button type="button" class="kh-time-btn" data-time="' + slot + '"',
        ' onclick="khWizard.selectTime(\'' + slot + '\')"',
        ' aria-label="' + slot + '">',
        '<span class="kh-time-icon" aria-hidden="true">&#128337;</span>',
        '<span>' + slot + '</span>',
        '</button>'
      ].join('');
    }).join('');
  }

  function selectTime(time) {
    state.selectedTime = time;
    document.querySelectorAll('.kh-time-btn').forEach(function (btn) {
      btn.classList.toggle('selected', btn.dataset.time === time);
    });
    setTimeout(function () { goToStep(4); }, 380);
  }

  /* ──────────────────────────────────────────────────────────────────────────
     STEP 4 — BOOKING SUMMARY & FORM PRE-FILL
     ──────────────────────────────────────────────────────────────────────── */
  function buildBookingSummary() {
    var el = document.getElementById('kh-booking-summary');
    if (!el) { return; }

    var cfg = window.KH_PARTY_CONFIG || {};
    var pkgs = cfg.packages || [];
    var pkg = null;
    for (var i = 0; i < pkgs.length; i++) {
      if (pkgs[i].id === state.selectedPackage) { pkg = pkgs[i]; break; }
    }

    var parts = [];
    if (pkg) {
      parts.push('<div class="kh-summary-item"><span aria-hidden="true">&#127881;</span><span>' + pkg.name + ' &nbsp;·&nbsp; ' + pkg.duration + '</span></div>');
    }
    if (state.selectedDate) {
      var d = new Date(state.selectedDate + 'T00:00:00');
      parts.push('<div class="kh-summary-item"><span aria-hidden="true">&#128197;</span><span>' + friendlyDate(d) + '</span></div>');
    }
    if (state.selectedTime) {
      parts.push('<div class="kh-summary-item"><span aria-hidden="true">&#128337;</span><span>' + state.selectedTime + '</span></div>');
    }

    el.innerHTML = parts.join('');
  }

  function prefillMessageField() {
    var form = document.getElementById('kh-party-form');
    if (!form) { return; }
    var msgField = form.querySelector('[name="message"]');
    if (!msgField || msgField.value.trim()) { return; }

    var cfg = window.KH_PARTY_CONFIG || {};
    var pkgs = cfg.packages || [];
    var pkg = null;
    for (var i = 0; i < pkgs.length; i++) {
      if (pkgs[i].id === state.selectedPackage) { pkg = pkgs[i]; break; }
    }

    var lines = ['[Booking Request]'];
    if (pkg) { lines.push('Package: ' + pkg.name); }
    if (state.selectedDate) {
      lines.push('Date: ' + friendlyDate(new Date(state.selectedDate + 'T00:00:00')));
    }
    if (state.selectedTime) { lines.push('Time: ' + state.selectedTime); }
    lines.push('');
    lines.push('Child name, age, theme, guest count, or special requests:');
    msgField.value = lines.join('\n');
  }

  function friendlyDate(date) {
    if (date.toLocaleDateString) {
      return date.toLocaleDateString('en-CA', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }
    return date.toString();
  }

  /* ──────────────────────────────────────────────────────────────────────────
     GOOGLE APPS SCRIPT SUBMISSION — Replace Brevo email flow
     ──────────────────────────────────────────────────────────────────────── */

  function parseTime12h(timeStr) {
    var match = (timeStr || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) { return null; }
    var hours = parseInt(match[1], 10);
    var minutes = parseInt(match[2], 10);
    var meridiem = match[3].toUpperCase();
    if (meridiem === 'PM' && hours !== 12) { hours += 12; }
    if (meridiem === 'AM' && hours === 12) { hours = 0; }
    return { hours: hours, minutes: minutes };
  }

  function buildStartEndTimes(dateStr, timeStr, durationStr) {
    var t = parseTime12h(timeStr);
    if (!t || !dateStr) {
      return { startTime: (dateStr || '') + ' ' + (timeStr || ''), endTime: '' };
    }

    var start = new Date(dateStr + 'T00:00:00');
    start.setHours(t.hours, t.minutes, 0, 0);

    var durationHours = parseFloat((durationStr || '').replace(/[^0-9.]/g, '')) || 0;
    var end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    function fmt(d) {
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
        ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    return {
      startTime: fmt(start),
      endTime: durationHours > 0 ? fmt(end) : ''
    };
  }

  function setFormStatus(msg, isError) {
    var el = document.getElementById('kh-form-status');
    if (!el) { return; }
    el.textContent = msg;
    el.style.color = isError ? '#dc2626' : '#78716c';
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    var form = document.getElementById('kh-party-form');
    if (!form) { return; }

    var firstName = (form.querySelector('[name="firstName"]') || {}).value || '';
    var lastName  = (form.querySelector('[name="lastName"]')  || {}).value || '';
    var email     = (form.querySelector('[name="email"]')     || {}).value || '';
    var phone     = (form.querySelector('[name="phone"]')     || {}).value || '';
    var guests    = (form.querySelector('[name="guests"]')    || {}).value || '';
    var childName = (form.querySelector('[name="childName"]') || {}).value || '';
    var childAge  = (form.querySelector('[name="childAge"]')  || {}).value || '';
    var notes     = (form.querySelector('[name="message"]')   || {}).value || '';

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setFormStatus('Please enter your full name.', true);
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormStatus('Please enter a valid email address.', true);
      return;
    }
    if (!phone.trim()) {
      setFormStatus('Please enter your phone number.', true);
      return;
    }

    var cfg = window.KH_PARTY_CONFIG || {};
    var pkgs = cfg.packages || [];
    var pkg = null;
    for (var i = 0; i < pkgs.length; i++) {
      if (pkgs[i].id === state.selectedPackage) { pkg = pkgs[i]; break; }
    }

    var times = buildStartEndTimes(
      state.selectedDate,
      state.selectedTime,
      pkg ? pkg.duration : ''
    );

    var payload = {
      name:      (firstName.trim() + ' ' + lastName.trim()).trim(),
      email:     email.trim(),
      phone:     phone.trim(),
      startTime: times.startTime,
      endTime:   times.endTime,
      guests:    guests.trim(),
      childName: childName.trim(),
      childAge:  childAge.trim(),
      notes:     notes.trim(),
      type:      'party'
    };

    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending\u2026';
    }
    setFormStatus('', false);

    submitBooking(payload).catch(function () {
      setFormStatus('Something went wrong. Please try again or email kenchahouse@gmail.com.', true);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Booking Request';
      }
    });
  }

  function submitBooking(formData) {
    return fetch(GAS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(function (response) {
      return response.json();
    }).then(function (result) {
      if (result.success) {
        showThankYou();
      } else {
        var msg = result.message || result.error || 'Booking failed. Please try again.';
        setFormStatus(msg, true);
        var submitBtn = document.querySelector('#kh-party-form button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Booking Request';
        }
      }
    });
  }

  function showThankYou() {
    var formEl = document.getElementById('kh-party-form');
    var indicator = document.getElementById('kh-step-indicator');
    var thankYou = document.getElementById('kh-thank-you');

    if (formEl) { formEl.setAttribute('hidden', ''); }
    if (indicator) { indicator.setAttribute('hidden', ''); }
    if (thankYou) { thankYou.removeAttribute('hidden'); }

    var summaryEl = document.getElementById('kh-thankyou-summary');
    if (summaryEl) {
      var cfg = window.KH_PARTY_CONFIG || {};
      var pkgs = cfg.packages || [];
      var pkg = null;
      for (var i = 0; i < pkgs.length; i++) {
        if (pkgs[i].id === state.selectedPackage) { pkg = pkgs[i]; break; }
      }
      var rows = [];
      if (pkg) {
        rows.push('<div class="kh-summary-item"><span aria-hidden="true">&#127881;</span><span>' + pkg.name + '</span></div>');
      }
      if (state.selectedDate) {
        rows.push('<div class="kh-summary-item"><span aria-hidden="true">&#128197;</span><span>' + friendlyDate(new Date(state.selectedDate + 'T00:00:00')) + '</span></div>');
      }
      if (state.selectedTime) {
        rows.push('<div class="kh-summary-item"><span aria-hidden="true">&#128337;</span><span>' + state.selectedTime + '</span></div>');
      }
      summaryEl.innerHTML = rows.join('');
    }

    scrollToSection();
  }

  /* ──────────────────────────────────────────────────────────────────────────
     PUBLIC API  (used by onclick= attributes in the HTML)
     ──────────────────────────────────────────────────────────────────────── */
  window.khWizard = {
    goToStep: goToStep,
    selectPackage: selectPackage,
    selectDate: selectDate,
    selectTime: selectTime,
    calPrev: calPrev,
    calNext: calNext
  };

  /* ──────────────────────────────────────────────────────────────────────────
     BOOT
     ──────────────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
