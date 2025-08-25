(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  loadScript("https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js")
    .then(function () {
      return loadScript("https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.34/moment-timezone-with-data-10-year-range.min.js");
    })
    .then(initCountdown);

  function initCountdown() {
    if (typeof moment === "undefined" || typeof moment.tz !== "function") {
      console.error("moment-timezone doesn't loaded");
      return;
    }

    var root = document.querySelector('.qure_sale-countdown');
    if (!root) return;

    var deadlineAttr = root.getAttribute('data-deadline');

    var defaultEnd = moment().tz("America/Los_Angeles")
      .add(customDays, 'days')
      .add(11, 'hours')
      .add(59, 'minutes')
      .add(59, 'seconds');

    var endTime = deadlineAttr
      ? moment.tz(deadlineAttr, "America/Los_Angeles")
      : defaultEnd;

    var valueFor = function (key) {
      return root.querySelector('.qs-value[data-key="' + key + '"]');
    };

    function pad2(n) {
      return String(n).padStart(2, '0');
    }

    function render() {
      var now = moment().tz("America/Los_Angeles");
      var diffSeconds = Math.max(0, endTime.diff(now, 'seconds'));

      var days = Math.floor(diffSeconds / (24 * 3600));
      diffSeconds -= days * 24 * 3600;
      var hours = Math.floor(diffSeconds / 3600);
      diffSeconds -= hours * 3600;
      var minutes = Math.floor(diffSeconds / 60);
      var seconds = diffSeconds - minutes * 60;

      var daysEl = valueFor('days');
      var hoursEl = valueFor('hours');
      var minutesEl = valueFor('minutes');
      var secondsEl = valueFor('seconds');

      if (daysEl) daysEl.textContent = pad2(days);
      if (hoursEl) hoursEl.textContent = pad2(hours);
      if (minutesEl) minutesEl.textContent = pad2(minutes);
      if (secondsEl) secondsEl.textContent = pad2(seconds);
    }

    render();
    var timerId = setInterval(function () {
      render();
      if (endTime.diff(moment().tz("America/Los_Angeles")) <= 0) {
        clearInterval(timerId);
      }
    }, 1000);
  }
})();
