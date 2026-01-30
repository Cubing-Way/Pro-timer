// time.js

export async function now() {
  const res = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC");
  const data = await res.json();

  // True UTC time from internet
  const utcMs = new Date(data.utc_datetime).getTime();

  // User timezone offset in minutes (e.g. Brazil = +180)
  const tzOffsetMinutes = new Date().getTimezoneOffset();

  // Convert UTC -> local time
  const localMs = utcMs - tzOffsetMinutes * 60 * 1000;

  const localTime = new Date(localMs);

  console.log("🕒 Correct local time:", localTime.toString());

  return localTime;
}

