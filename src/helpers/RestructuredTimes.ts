import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export function getDateRangeUTC(
  startDate: string,
  endDate: string,
  timeZone: string
): { startUTC: Date; endExclusiveUTC: Date } {
  if (!startDate || !endDate) throw new Error('startDate y endDate son obligatorios');
  if (!timeZone) throw new Error('timeZone es obligatorio');

  const startUTC = fromZonedTime(`${startDate} 00:00:00`, timeZone);

  const [year, month, day] = endDate.split('-').map(Number);
  const nextDayUTC = new Date(Date.UTC(year, month - 1, day + 1));
  const nextDayStr = nextDayUTC.toISOString().slice(0, 10); 

  const endExclusiveUTC = fromZonedTime(`${nextDayStr} 00:00:00`, timeZone);

  return { startUTC, endExclusiveUTC };
}
export function toLocalDateString(date: Date | string, timeZone: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(d, timeZone, 'yyyy-MM-dd');
}