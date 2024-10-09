/**
 * From CodeWars -- https://www.codewars.com/kata/52742f58faf5485cae000b9a
 *
 * Formats a duration, given as a number of seconds, in a human-friendly way.
 * The function must accept a non-negative integer. If it is zero, it just returns
 * "now". Otherwise, the duration is expressed as a combination of years, days,
 * hours, minutes and seconds.
 *
 * # Example
 *
 * * For seconds = 62, your function should return "1 minute and 2 seconds"
 * * For seconds = 3662, your function should return "1 hour, 1 minute and 2 seconds"
 *
 * A year is 365 days and a day is 24 hours.
 *
 * Note that spaces are important.
 *
 * Detailed rules
 *
 * - The resulting expression is made of components like 4 seconds, 1 year, etc.
 *     In general, a positive integer and one of the valid units of time, separated
 *     by a space. The unit of time is used in plural if the integer is greater than 1;
 * - The components are separated by a comma and a space (", "). Except the last
 *     component, which is separated by " and ", just like it would be written in English;
 * - A more significant units of time will occur before than a least significant one.
 *     Therefore, 1 second and 1 year is not correct, but 1 year and 1 second is;
 * - Different components have different unit of times. So there is not repeated
 *     units like in 5 seconds and 1 second;
 * - A component will not appear at all if its value happens to be zero. Hence,
 *     1 minute and 0 seconds is not valid, but it should be just 1 minute;
 * - A unit of time must be used "as much as possible". It means that the function
 *     should not return 61 seconds, but 1 minute and 1 second instead. Formally,
 *     the duration specified by of a component must not be greater than any valid
 *     more significant unit of time;
 */
function formatDuration (seconds) {
  if (!seconds) {
    return 'now';
  }

  const SECONDS_IN_YEAR = 31536000,
    SECONDS_IN_DAY = 86400,
    SECONDS_IN_HOUR = 3600,
    SECONDS_IN_MINUTE = 60;

  let times = [];

  if (seconds >= SECONDS_IN_YEAR) {
    let years = parseInt(seconds/SECONDS_IN_YEAR);

    times.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    seconds = seconds % SECONDS_IN_YEAR;
  }

  if (seconds >= SECONDS_IN_DAY) {
    let days = parseInt(seconds/SECONDS_IN_DAY);

    times.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    seconds = seconds % SECONDS_IN_DAY;
  }

  if (seconds >= SECONDS_IN_HOUR) {
    let hours = parseInt(seconds/SECONDS_IN_HOUR);

    times.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    seconds = seconds % SECONDS_IN_HOUR;
  }

  if (seconds >= SECONDS_IN_MINUTE) {
    let minutes = parseInt(seconds/SECONDS_IN_MINUTE);

    times.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    seconds = seconds % SECONDS_IN_MINUTE;
  }

  if (seconds) {
    times.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
  }

  if (times.length === 1) {
    return times[0];
  }

  return times.slice(0, times.length - 1).join(', ').concat(` and ${times[times.length - 1]}`);
}
