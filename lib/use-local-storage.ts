'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Persisted state hook. Reads from localStorage after mount (to avoid
 * hydration mismatches) and writes back on every change.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(() =>
    typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue,
  )
  const [hydrated, setHydrated] = useState(false)
  const keyRef = useRef(key)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(keyRef.current)
      if (raw != null) setValue(JSON.parse(raw) as T)
    } catch {
      // ignore malformed / unavailable storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(keyRef.current, JSON.stringify(value))
    } catch {
      // ignore quota / unavailable storage
    }
  }, [value, hydrated])

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) =>
      typeof next === 'function' ? (next as (prev: T) => T)(prev) : next,
    )
  }, [])

  return [value, set, hydrated]
}
