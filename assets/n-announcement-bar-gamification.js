(function () {
    function loadScript(src) {
      return new Promise(function (resolve, reject) {
        var existing = document.querySelector('script[src="' + src + '"]');
        if (existing) { resolve(); return; }
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
        console.error("moment-timezone not loaded");
        return;
      }
  
      var root = document.querySelector('.e-countdown');
      if (!root) return;
  
      var children = root.querySelectorAll(':scope > div[data-key]');
      if (children.length < 4) return;
  
      var daysEl    = children[0];
      var hoursEl   = children[1];
      var minutesEl = children[2];
      var secondsEl = children[3];
  
      var deadlineAttr = root.getAttribute('data-deadline');
  
      var days = (typeof customDays !== 'undefined') ? customDays : 0;

      var from = root.getAttribute('data-from');

      var defaultEnd = moment().tz("America/Los_Angeles")
        .add(days, 'days')
        .add(11, 'hours')
        .add(59, 'minutes')
        .add(59, 'seconds');

      var endTime = from
        ? moment.tz(from, "America/Los_Angeles").add(customDays, 'days').add(11, 'hours').add(59, 'minutes').add(59, 'seconds')
        : defaultEnd;
  
      function pad2(n) {
        return String(n).padStart(2, '0');
      }
  
      function render() {
        var now = moment().tz("America/Los_Angeles");
        var diffSeconds = Math.max(0, endTime.diff(now, 'seconds'));
  
        var d = Math.floor(diffSeconds / (24 * 3600));
        diffSeconds -= d * 24 * 3600;
        var h = Math.floor(diffSeconds / 3600);
        diffSeconds -= h * 3600;
        var m = Math.floor(diffSeconds / 60);
        var s = diffSeconds - m * 60;
  
        daysEl.textContent    = pad2(d);
        hoursEl.textContent   = pad2(h);
        minutesEl.textContent = pad2(m);
        secondsEl.textContent = pad2(s);
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