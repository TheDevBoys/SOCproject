'use client'

import { useState, type FormEvent } from 'react'
import Button from '../../src/components/ui/Button'

export type RoleAccess = { name: string; permissions: string[] }
export type RoleCatalog = { roles: RoleAccess[]; permissions: string[] }

export async function roleRequest<T>(path = '', method = 'GET', body?: RoleAccess): Promise<T> {
  const response = await fetch(`/api/roles${path}`, {
    method,
    cache: 'no-store',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? `Access settings request failed (${response.status}).`)
  }

  return response.status === 204 || response.status === 201 ? undefined as T : response.json()
}

type Props = {
  mode: 'create' | 'role' | 'user'
  initial: RoleAccess
  catalog: RoleCatalog
  target?: string
  onSaved: () => Promise<void>
  onCancel: () => void
}

export default function RoleEditor({ mode, initial, catalog, target, onSaved, onCancel }: Props) {
  const [name, setName] = useState(initial.name)
  const [permissions, setPermissions] = useState(initial.permissions)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inherited = mode === 'user' ? catalog.roles.find(role => role.name === name)?.permissions ?? [] : []

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const path = mode === 'user' ? `/users/${target}` : mode === 'role' ? '/permissions' : ''
      await roleRequest(path, mode === 'create' ? 'POST' : 'PUT', { name: name.trim(), permissions })
      await onSaved()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save access settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save}>
      <fieldset disabled={saving}>
        <legend>{mode === 'user' ? 'User access' : mode === 'create' ? 'New role' : name}</legend>
        {mode === 'create' && (
          <label>Role name <input required maxLength={20} value={name} onChange={event => setName(event.target.value)} /></label>
        )}
        {mode === 'user' && (
          <label>Role <select value={name} onChange={event => setName(event.target.value)}>
            {catalog.roles.filter(role => role.name !== 'Superuser').map(role => (
              <option key={role.name}>{role.name}</option>
            ))}
          </select></label>
        )}
        <fieldset>
          <legend>{mode === 'user' ? 'Direct permissions' : 'Role permissions'}</legend>
          {catalog.permissions.map(permission => (
            <div key={permission}>
              <label>
                <input type="checkbox" checked={permissions.includes(permission)} onChange={event => {
                  setPermissions(current => event.target.checked
                    ? [...current, permission]
                    : current.filter(key => key !== permission))
                }} />{' '}{permission}
              </label>
              {inherited.includes(permission) && <small> · Via {name}</small>}
            </div>
          ))}
        </fieldset>
        <Button type="submit">{saving ? 'Saving…' : 'Save'}</Button>{' '}
        <Button type="button" onClick={onCancel}>Cancel</Button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
