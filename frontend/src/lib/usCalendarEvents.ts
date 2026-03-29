/** US federal holidays + widely celebrated US observances for a given calendar day. */

export type UsCalendarEventKind = 'federal' | 'observance'

export type UsCalendarEvent = {
  name: string
  kind: UsCalendarEventKind
}

/** 0 = Sunday … 6 = Saturday */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): number {
  const firstDow = new Date(year, month, 1).getDay()
  const firstOccurrence = 1 + ((weekday - firstDow + 7) % 7)
  return firstOccurrence + (n - 1) * 7
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number): number {
  const lastDate = new Date(year, month + 1, 0)
  const lastDay = lastDate.getDate()
  const lastDow = lastDate.getDay()
  return lastDay - ((lastDow - weekday + 7) % 7)
}

/** Gregorian Easter Sunday → { month: 0–11, day } */
function easterSunday(year: number): { month: number; day: number } {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const monthNum = Math.floor((h + l - 7 * m + 114) / 31) // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1
  const month = monthNum === 3 ? 2 : 3 // March = 2, April = 3 in JS
  return { month, day }
}

/**
 * Returns holidays/observances on `year` / `month` (0–11) / `day` (1–31).
 */
export function getUsCalendarEvents(year: number, month: number, day: number): UsCalendarEvent[] {
  const out: UsCalendarEvent[] = []

  const add = (name: string, kind: UsCalendarEventKind) => out.push({ name, kind })

  // Fixed-date federal & popular
  if (month === 0 && day === 1) add("New Year's Day", 'federal')
  if (month === 5 && day === 19) add('Juneteenth National Independence Day', 'federal')
  if (month === 6 && day === 4) add('Independence Day', 'federal')
  if (month === 10 && day === 11) add('Veterans Day', 'federal')
  if (month === 11 && day === 25) add('Christmas Day', 'federal')

  // Floating federal holidays
  if (month === 0 && day === nthWeekdayOfMonth(year, 0, 1, 3)) add('Martin Luther King Jr. Day', 'federal')
  if (month === 1 && day === nthWeekdayOfMonth(year, 1, 1, 3)) add("Presidents' Day", 'federal')
  if (month === 4 && day === lastWeekdayOfMonth(year, 4, 1)) add('Memorial Day', 'federal')
  if (month === 8 && day === nthWeekdayOfMonth(year, 8, 1, 1)) add('Labor Day', 'federal')
  if (month === 9 && day === nthWeekdayOfMonth(year, 9, 1, 2))
    add('Columbus Day / Indigenous Peoples\' Day', 'federal')
  if (month === 10 && day === nthWeekdayOfMonth(year, 10, 4, 4)) add('Thanksgiving Day', 'federal')

  // Widely celebrated / famous US observances
  if (month === 1 && day === 2) add('Groundhog Day', 'observance')
  if (month === 1 && day === 14) add("Valentine's Day", 'observance')
  if (month === 2 && day === 17) add("St. Patrick's Day", 'observance')
  if (month === 4 && day === 5) add('Cinco de Mayo', 'observance')
  if (month === 4 && day === nthWeekdayOfMonth(year, 4, 0, 2)) add("Mother's Day", 'observance')
  if (month === 5 && day === nthWeekdayOfMonth(year, 5, 0, 3)) add("Father's Day", 'observance')
  if (month === 9 && day === 31) add('Halloween', 'observance')
  if (month === 11 && day === 31) add("New Year's Eve", 'observance')

  const easter = easterSunday(year)
  if (month === easter.month && day === easter.day) add('Easter Sunday', 'observance')

  // Independence Day observed (federal): Sat → Fri before; Sun → Mon after
  const j4dow = new Date(year, 6, 4).getDay()
  if (j4dow === 6 && month === 6 && day === 3) add('Independence Day (observed)', 'federal')
  if (j4dow === 0 && month === 6 && day === 5) add('Independence Day (observed)', 'federal')

  return out
}
