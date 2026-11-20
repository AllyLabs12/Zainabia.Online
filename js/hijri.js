/**
 * Minimal Gregorian -> Hijri (tabular/civil Islamic calendar) converter.
 * This is an approximation (+/- 1 day around moon-sighting edge cases) —
 * good enough for auto-switching the site theme, not for religious rulings.
 */
(function (global) {
  function gregorianToJD(year, month, day) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return (
      day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045
    );
  }

  function jdToHijri(jd) {
    jd = Math.floor(jd) + 0.5;
    const islamicEpoch = 1948439.5;
    let days = Math.floor(jd - islamicEpoch) + 1;
    let year = Math.floor((30 * days + 10646) / 10631);
    let priorDays = days - Math.floor((10631 * (year - 1) + 10646) / 30);
    let month = Math.min(12, Math.ceil(priorDays / 29.5) || 1);
    while (hijriMonthStartOffset(year, month) > priorDays) month--;
    let day = priorDays - hijriMonthStartOffset(year, month) + 1;
    return { year, month, day };
  }

  function hijriMonthStartOffset(year, month) {
    return Math.ceil(29.5 * (month - 1));
  }

  function gregorianToHijri(date) {
    const jd = gregorianToJD(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    return jdToHijri(jd);
  }

  global.ZainabiaHijri = { gregorianToHijri };
})(window);
