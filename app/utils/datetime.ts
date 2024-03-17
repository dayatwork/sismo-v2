export function getFirstMondaysInYear(year: number, timeZoneOffsetMinutes = 0) {
  const firstMondays: Date[] = [];

  // Loop through the weeks of the year
  for (let week = 0; week < 53; week++) {
    // Get the date for the first day of the week (Sunday)
    const date = new Date(year, 0, 1 + week * 7);

    // Apply the timezone offset
    date.setMinutes(date.getMinutes() + timeZoneOffsetMinutes);

    // Calculate the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = date.getDay();

    // Calculate the number of days to add to get to the first Monday of the week
    const daysUntilMonday = 1 - dayOfWeek;

    // Calculate the date of the first Monday of the week
    const firstMonday = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + daysUntilMonday
    );

    // Check if the first Monday is still in the same year
    if (firstMonday.getFullYear() === year) {
      firstMondays.push(firstMonday);
    }
  }

  return firstMondays;
}

export function getWeekNumber(date: string | Date) {
  const currentDate = new Date(date);
  currentDate.setHours(0, 0, 0, 0); // Set time to midnight to avoid issues with daylight saving time
  currentDate.setDate(currentDate.getDate() + 4 - (currentDate.getDay() || 7)); // Set to the nearest Thursday
  const yearStart = new Date(currentDate.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((currentDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNumber;
}

export function getTotalWeeksInYear(year: number) {
  const januaryFirst = new Date(year, 0, 1);
  const dayOfWeek = januaryFirst.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Calculate the number of days until the next Monday
  const daysUntilNextMonday = (7 - dayOfWeek) % 7;

  // Calculate the date of the first Monday of the year
  const firstMonday = new Date(year, 0, 1 + daysUntilNextMonday);

  // Calculate the date of the last day of the year
  const lastDay = new Date(year, 11, 31);

  // Calculate the total number of weeks
  const totalWeeks =
    Math.floor(
      (lastDay.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)
    ) + 1;

  return totalWeeks;
}

export function millisecondsToHHMMSS(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
