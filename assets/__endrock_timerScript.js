(() => {
    
    const initializeTimer = (timerElement) => {
        
        const gamificationContainer = timerElement.closest('[data-endrock-gamification]');
        if (!gamificationContainer) return;

        const startDateStr = gamificationContainer.dataset.startDate;
        const startHour = parseInt(gamificationContainer.dataset.startTimeHour);
        const startMinute = parseInt(gamificationContainer.dataset.startTimeMinute);
        const endDateStr = gamificationContainer.dataset.endDate;
        const endHour = parseInt(gamificationContainer.dataset.endTimeHour);
        const endMinute = parseInt(gamificationContainer.dataset.endTimeMinute);

        if (!endDateStr || isNaN(endHour) || isNaN(endMinute) || !startDateStr || isNaN(startHour) || isNaN(startMinute)) {
            timerElement.style.display = 'none'; 
            return;
        }

        const parseDateParts = (dateString) => {
            const parts = dateString.split('-').map(p => parseInt(p, 10));
            if (parts.length !== 3) return null;
            return { year: parts[0], month: parts[1] - 1, day: parts[2] };
        };

        const startParts = parseDateParts(startDateStr);
        const endParts = parseDateParts(endDateStr);

        if (!startParts || !endParts) {
            timerElement.style.display = 'none';
            return;
        }

        const startDateObj = new Date(startParts.year, startParts.month, startParts.day, startHour, startMinute, 0);
        const targetDate = new Date(endParts.year, endParts.month, endParts.day, endHour, endMinute, 59, 999); 
        
        if (isNaN(targetDate.getTime()) || isNaN(startDateObj.getTime())) {
            timerElement.style.display = 'none';
            return;
        }
        
        const countdownEnd = targetDate.getTime();
        const countdownStart = startDateObj.getTime();

        const daysEl = timerElement.querySelector('[data-key="days"]');
        const hoursEl = timerElement.querySelector('[data-key="hours"]');
        const minutesEl = timerElement.querySelector('[data-key="minutes"]');
        const secondsEl = timerElement.querySelector('[data-key="seconds"]');

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        const pad2 = (n) => String(n).padStart(2, '0');

        let timerInterval = null;

        const renderCountdown = () => {
            const now = Date.now();
            
            if (now >= countdownEnd) {
                clearInterval(timerInterval);
                timerElement.style.display = 'none';
                return;
            }

            if (now < countdownStart) {
                clearInterval(timerInterval);
                timerElement.style.display = 'none';
                return;
            }

            const remaining = countdownEnd - now;
            const totalSeconds = Math.floor(remaining / 1000);
            
            const days = Math.floor(totalSeconds / (3600 * 24));
            const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            daysEl.textContent = pad2(days);
            hoursEl.textContent = pad2(hours);
            minutesEl.textContent = pad2(minutes);
            secondsEl.textContent = pad2(seconds);
        };
        
        renderCountdown();
        timerInterval = setInterval(renderCountdown, 1000);

    };

    document.querySelectorAll('endrock-countdown-timer').forEach(initializeTimer);

})();