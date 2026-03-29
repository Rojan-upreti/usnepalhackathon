import { filterUSUniversities } from '@/lib/usUniversities'
import { useId, useMemo, useRef, useState } from 'react'

type Props = {
  collegeName: string
  onCollegeNameChange: (name: string) => void
  onContinue: () => void
  onBack?: () => void
  error?: string | null
}

export function UniversityPickerPanel({
  collegeName,
  onCollegeNameChange,
  onContinue,
  onBack,
  error,
}: Props) {
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)

  const suggestions = useMemo(() => filterUSUniversities(collegeName, 12), [collegeName])

  const pick = (name: string) => {
    onCollegeNameChange(name)
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/80">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Your university</h2>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
        Search U.S. schools or type your own. We use this for demo login URLs and your profile.
      </p>

      {error ? <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p> : null}

      <div className="relative mt-3">
        <label htmlFor={listId} className="sr-only">
          University name
        </label>
        <input
          ref={inputRef}
          id={listId}
          type="text"
          value={collegeName}
          onChange={(e) => {
            onCollegeNameChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 180)
          }}
          autoComplete="off"
          placeholder="e.g. University of California, Los Angeles"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${listId}-suggestions`}
          aria-autocomplete="list"
        />
        {open && suggestions.length > 0 ? (
          <ul
            id={`${listId}-suggestions`}
            role="listbox"
            className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800"
          >
            {suggestions.map((name) => (
              <li key={name} role="option">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-xs text-gray-800 hover:bg-indigo-50 dark:text-gray-100 dark:hover:bg-gray-700"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(name)}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Continue
        </button>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  )
}
