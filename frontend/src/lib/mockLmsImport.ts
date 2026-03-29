import type { CalendarEntry } from '@/lib/calendarEntries'
import type { LmsProvider } from '@/lib/lmsFirestore'
import { toISODateLocal } from '@/lib/calendarEntries'

function addDaysFromToday(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toISODateLocal(d)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

const COURSE_POOL = [
  'CS 201 — Data Structures',
  'MATH 151 — Calculus II',
  'ENGL 102 — Composition & Rhetoric',
  'PHYS 110 — Mechanics',
  'CHEM 121 — General Chemistry',
  'PSYC 101 — Intro Psychology',
  'ECON 201 — Microeconomics',
  'BIO 180 — Cell Biology',
]

type Template = Omit<CalendarEntry, 'id' | 'source' | 'lmsProvider' | 'lmsKind'> & {
  lmsKind: string
}

function buildTemplates(courses: string[]): Template[] {
  const [c0, c1, c2, c3] = courses
  return [
    {
      type: 'deadline',
      title: `Discussion post — ${c0}`,
      date: addDaysFromToday(-2),
      dueDate: addDaysFromToday(-2),
      dueTime: '23:59',
      notes: 'Initial post + two peer replies. Rubric on LMS.',
      lmsKind: 'discussion',
    },
    {
      type: 'deadline',
      title: `Problem set 6 — ${c1}`,
      date: addDaysFromToday(1),
      dueDate: addDaysFromToday(1),
      dueTime: '09:00',
      notes: 'Submit PDF to dropbox. Show all work.',
      lmsKind: 'assignment',
    },
    {
      type: 'deadline',
      title: `Module quiz — ${c2}`,
      date: addDaysFromToday(3),
      dueDate: addDaysFromToday(3),
      dueTime: '17:00',
      notes: '25 min timed attempt. One attempt only.',
      lmsKind: 'quiz',
    },
    {
      type: 'deadline',
      title: `Midterm exam — ${c0}`,
      date: addDaysFromToday(7),
      dueDate: addDaysFromToday(7),
      dueTime: '10:30',
      notes: 'In-person. Bring student ID. Covers chapters 1–5.',
      lmsKind: 'exam',
    },
    {
      type: 'deadline',
      title: `Lab report draft — ${c3}`,
      date: addDaysFromToday(4),
      dueDate: addDaysFromToday(4),
      notes: 'Peer review opens after submission.',
      lmsKind: 'assignment',
    },
    {
      type: 'deadline',
      title: `Reading reflection — ${c2}`,
      date: addDaysFromToday(0),
      dueDate: addDaysFromToday(0),
      dueTime: '20:00',
      notes: '300–500 words. Cite at least one course reading.',
      lmsKind: 'discussion',
    },
    {
      type: 'time_block',
      title: `Office hours — ${c1}`,
      date: addDaysFromToday(2),
      startTime: '14:00',
      endTime: '15:30',
      notes: 'Zoom link in LMS announcements.',
      lmsKind: 'office_hours',
    },
    {
      type: 'deadline',
      title: `Group project milestone — ${c0}`,
      date: addDaysFromToday(10),
      dueDate: addDaysFromToday(10),
      dueTime: '23:59',
      notes: 'Upload slide deck + division of labor doc.',
      lmsKind: 'assignment',
    },
    {
      type: 'deadline',
      title: `Pop-style check-in quiz — ${c3}`,
      date: addDaysFromToday(5),
      dueDate: addDaysFromToday(5),
      dueTime: '12:00',
      notes: 'Opens at noon; 15 minutes to complete.',
      lmsKind: 'quiz',
    },
    {
      type: 'deadline',
      title: `Final project proposal — ${c0}`,
      date: addDaysFromToday(14),
      dueDate: addDaysFromToday(14),
      notes: 'One page + bibliography. Advisor approval required.',
      lmsKind: 'assignment',
    },
    {
      type: 'time_block',
      title: `Review session — ${c1}`,
      date: addDaysFromToday(6),
      startTime: '18:00',
      endTime: '19:30',
      notes: 'Recorded if you cannot attend live.',
      lmsKind: 'review_session',
    },
    {
      type: 'deadline',
      title: `Syllabus & honor code acknowledgment — ${c2}`,
      date: addDaysFromToday(-5),
      dueDate: addDaysFromToday(-5),
      dueTime: '23:59',
      notes: 'Required before accessing grades.',
      lmsKind: 'policy',
    },
    {
      type: 'deadline',
      title: `Peer review window closes — ${c3}`,
      date: addDaysFromToday(8),
      dueDate: addDaysFromToday(8),
      dueTime: '08:00',
      notes: 'Complete reviews for three assigned drafts.',
      lmsKind: 'discussion',
    },
    {
      type: 'deadline',
      title: `Portfolio checkpoint — ${c2}`,
      date: addDaysFromToday(12),
      dueDate: addDaysFromToday(12),
      dueTime: '16:00',
      notes: 'Upload artifacts from weeks 1–6.',
      lmsKind: 'assignment',
    },
  ]
}

export function generateLmsDataset(
  provider: LmsProvider,
  accountDisplayName: string,
  collegeName: string,
): {
  institutionName: string
  semesterLabel: string
  courses: string[]
  displayName: string
  events: CalendarEntry[]
} {
  const institutionName = collegeName.trim() || 'Your university'
  const displayName = accountDisplayName.trim() || 'Student'
  const year = new Date().getFullYear()
  const semesterLabel = randomFrom([
    `Spring ${year}`,
    `Fall ${year}`,
    `Summer ${year}`,
    `Winter ${year}`,
  ])
  const courses = shuffle(COURSE_POOL).slice(0, 4 + Math.floor(Math.random() * 2))

  const source = provider === 'canvas' ? 'lms_canvas' : 'lms_blackboard'
  const templates = shuffle(buildTemplates(courses)).slice(0, 10 + Math.floor(Math.random() * 4))

  const events: CalendarEntry[] = templates.map((t) => {
    const id = `lms_${provider}_${crypto.randomUUID()}`
    const { lmsKind, ...rest } = t
    return {
      ...rest,
      id,
      source,
      lmsProvider: provider,
      lmsKind,
    }
  })

  return {
    institutionName,
    semesterLabel,
    courses,
    displayName,
    events,
  }
}
