export const convertTimeStringToSeconds = (timeString: string): number => {
  timeString = timeString.replace(',', '.');
  const match = timeString.match(/^(\d+(\.\d+)?)([hms]?)$/);
  if (!match) {
    throw new Error('Invalid time format');
  }

  const value: number = parseFloat(match[1]);
  const unit: string = match[3];

  switch (unit) {
    case 'h':
      return value * 3600;
    case 'm':
      return value * 60;
    case 's':
      return value;
    default:
      return value;
  }
};
