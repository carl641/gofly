// Fly the Shoals — home page interactions
(function () {
  // Footer year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
      }
    });
  }

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll + count-up for the boarding tracker
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.card, .notice, .welcome-copy, .side-link, .side-video');

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && !reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        var counter = entry.target.querySelector('[data-count]');
        if (counter) countUp(counter);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // Live weather for Muscle Shoals via Open-Meteo (free, no key).
  // Falls back to the static values in the markup if the request fails.
  var WX_CODES = {
    0: ['Clear', '☀️'], 1: ['Mostly Clear', '🌤️'], 2: ['Partly Cloudy', '⛅'],
    3: ['Overcast', '☁️'], 45: ['Fog', '🌫️'], 48: ['Fog', '🌫️'],
    51: ['Light Drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Drizzle', '🌦️'],
    61: ['Light Rain', '🌧️'], 63: ['Rain', '🌧️'], 65: ['Heavy Rain', '🌧️'],
    71: ['Light Snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy Snow', '🌨️'],
    80: ['Showers', '🌦️'], 81: ['Showers', '🌧️'], 82: ['Heavy Showers', '🌧️'],
    95: ['Thunderstorms', '⛈️'], 96: ['Thunderstorms', '⛈️'], 99: ['Thunderstorms', '⛈️']
  };

  var url = 'https://api.open-meteo.com/v1/forecast?latitude=34.7448&longitude=-87.61' +
    '&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m' +
    '&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago';

  fetch(url)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var c = data.current;
      var info = WX_CODES[c.weather_code] || ['Current Conditions', '🌡️'];
      document.getElementById('wx-temp').textContent = Math.round(c.temperature_2m) + '°F';
      document.getElementById('wx-desc').textContent = info[0];
      document.getElementById('wx-emoji').textContent = info[1];
      document.getElementById('wx-extra').textContent =
        'Wind ' + Math.round(c.wind_speed_10m) + ' mph · Humidity ' + Math.round(c.relative_humidity_2m) + '%';
    })
    .catch(function () { /* keep static fallback */ });
})();
