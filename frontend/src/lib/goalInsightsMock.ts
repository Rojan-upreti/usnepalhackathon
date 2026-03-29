import type { GoalDomain } from '@/lib/goalsFirestore'

export type GoalInsightTemplate = {
  templateId: string
  domain: GoalDomain
  headline: string
  mockMetric: string
  suggestedGoalTitle: string
  suggestedGoalDetail: string
  /** Total weeks shown on the goal timeline (mock planning horizon). */
  durationWeeks: number
  /** Three checkpoints from start → midpoint → target review. */
  milestones: [string, string, string]
  /** When true, only shown for students / dual role (not professional-only). */
  studentOnly?: boolean
}

export const GOAL_INSIGHT_TEMPLATES: GoalInsightTemplate[] = [
  {
    templateId: 'cal-buffer-evenings',
    domain: 'calendar',
    headline: 'Your calendar clusters late in the day',
    mockMetric: 'Mock sync: 4 events this week end after 6pm',
    suggestedGoalTitle: 'Protect two wind-down evenings',
    suggestedGoalDetail: 'Block 7–9pm as no-meeting time on Tue and Thu for the next two weeks.',
    durationWeeks: 2,
    milestones: ['Block Tue & Thu evenings', 'Hold boundaries for 10 days', 'Review energy + adjust'],
  },
  {
    templateId: 'cal-import-sources',
    domain: 'calendar',
    headline: 'Multiple calendars, one view',
    mockMetric: 'Mock: Google + LMS events could overlap on 2 days',
    suggestedGoalTitle: 'Keep imports fresh',
    suggestedGoalDetail: 'Re-import or connect calendars every Sunday so deadlines stay accurate.',
    durationWeeks: 3,
    milestones: ['Sunday import ritual', 'Resolve overlaps on Mon', 'Month-end calendar audit'],
  },
  {
    templateId: 'sleep-duration',
    domain: 'sleep',
    headline: 'Sleep duration is trending a little short',
    mockMetric: 'Mock 7-night avg: 6h 42m (target 7h 30m)',
    suggestedGoalTitle: 'Aim for 7.5h sleep',
    suggestedGoalDetail: 'Move bedtime 20 minutes earlier on weeknights for two weeks and log nights in My Sleep.',
    durationWeeks: 2,
    milestones: ['Shift bedtime −20 min', 'Track 7 nights in My Sleep', 'Compare avg vs target'],
  },
  {
    templateId: 'sleep-consistency',
    domain: 'sleep',
    headline: 'Bedtime variance is high',
    mockMetric: 'Mock: ±95 min swing across last 5 nights',
    suggestedGoalTitle: 'Stabilize sleep window',
    suggestedGoalDetail: 'Pick a fixed lights-out range (e.g. 11:00–11:30pm) and stick to it 5 nights/week.',
    durationWeeks: 3,
    milestones: ['Pick lights-out window', 'Hit 5/7 nights', 'Tighten wake time on weekends'],
  },
  {
    templateId: 'health-wellness-streak',
    domain: 'health',
    headline: 'Wellness check-ins could be steadier',
    mockMetric: 'Mock: mood logged 3 of last 7 days',
    suggestedGoalTitle: 'Daily mood + one walk',
    suggestedGoalDetail: 'Log mood in Health App after lunch and take a 15-minute walk 5 days this week.',
    durationWeeks: 2,
    milestones: ['After-lunch mood log', '5× 15-min walks', 'Streak check in Health App'],
  },
  {
    templateId: 'career-resume-pass',
    domain: 'career',
    headline: 'Career Coach is ready for a refresh pass',
    mockMetric: 'Mock: last resume tweak 18 days ago',
    suggestedGoalTitle: 'Polish resume + one target role',
    suggestedGoalDetail: 'Run one Career Coach review and add a bullet tied to your top target job description.',
    durationWeeks: 2,
    milestones: ['Paste target JD keywords', 'Career Coach pass + edits', 'One tailored bullet shipped'],
  },
  {
    templateId: 'career-networking',
    domain: 'career',
    headline: 'Light networking cadence',
    mockMetric: 'Mock: 0 informational chats logged this month',
    suggestedGoalTitle: 'Two meaningful outreach messages',
    suggestedGoalDetail: 'Send two short notes to alumni or peers this week with a specific ask or shared interest.',
    durationWeeks: 1,
    milestones: ['Draft 3 names to message', 'Send two short notes', 'Optional 15-min follow-up'],
  },
  {
    templateId: 'lms-deadline-rhythm',
    domain: 'lms',
    headline: 'Assignments bunch before midterms',
    mockMetric: 'Mock LMS: 3 due within 48 hours next week',
    suggestedGoalTitle: 'Start the smallest task first',
    suggestedGoalDetail: 'Spend 25 minutes on the earliest-due assignment every morning for five days.',
    studentOnly: true,
    durationWeeks: 1,
    milestones: ['25 min on earliest due', 'Repeat 5 mornings', 'Submit or unblock early'],
  },
  {
    templateId: 'lms-study-blocks',
    domain: 'lms',
    headline: 'Study blocks vs. class schedule',
    mockMetric: 'Mock: 11 free hours on calendar; 6 used for deep work',
    suggestedGoalTitle: 'Three 90-minute deep-work blocks',
    suggestedGoalDetail: 'Book three calendar holds labeled “Deep work” and match them to LMS module goals.',
    studentOnly: true,
    durationWeeks: 2,
    milestones: ['Book 3 deep-work holds', 'Map blocks to LMS modules', 'Protect blocks for 2 weeks'],
  },
]

export function getGoalTemplateById(templateId: string): GoalInsightTemplate | undefined {
  return GOAL_INSIGHT_TEMPLATES.find((t) => t.templateId === templateId)
}
