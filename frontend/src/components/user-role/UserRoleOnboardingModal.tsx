import { useUserRole } from '@/contexts/UserRoleContext'
import type { UserWorkStatus } from '@/lib/userStatsFirestore'
import { useState } from 'react'

export function UserRoleOnboardingModal() {
  const { saveStatus, profileError } = useUserRole()
  const [student, setStudent] = useState(false)
  const [professional, setProfessional] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const canSubmit = student || professional

  const submit = async () => {
    if (!canSubmit) return
    setLocalError(null)
    setSaving(true)
    let next: UserWorkStatus
    if (student && professional) next = 'both'
    else if (student) next = 'student'
    else next = 'professional'
    try {
      await saveStatus(next)
    } catch (e: unknown) {
      setLocalError(e instanceof Error ? e.message : 'Could not save. Check Firestore rules.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-role-onboarding-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <h2 id="user-role-onboarding-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          How do you use EaseUp?
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Select all that apply.</p>

        <div className="mt-6 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/80">
            <input
              type="checkbox"
              checked={student}
              onChange={(e) => setStudent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Student</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Classes, deadlines, campus workload</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/80">
            <input
              type="checkbox"
              checked={professional}
              onChange={(e) => setProfessional(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Working professional</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Job, meetings, and career schedule</span>
            </span>
          </label>
        </div>

        {(profileError || localError) && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
            {localError ?? profileError}
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit || saving}
          onClick={submit}
          className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
