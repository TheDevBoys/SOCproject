'use client'

import { useState, type FormEvent } from 'react'
import { roleLabel } from '../../src/types/roleLabels'
import Button from '../../src/components/ui/Button'
import UserDialog from './UserDialog'
import styles from './page.module.css'

export type RoleAccess = { name: string; displayName?: string; permissions: string[]; customerId?: number }
export type PermissionInfo = { key: string; name: string; description: string; isAssignable: boolean }
export type RoleCatalog = {
  roles: RoleAccess[]
  permissions: PermissionInfo[]
}

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
  customers?: { id: number; name: string }[]
  target?: string
  userName?: string
  onSaved: () => Promise<void>
  onCancel: () => void
}

export default function RoleEditor({ mode, initial, catalog, customers = [], target, userName, onSaved, onCancel }: Props) {
  const [name, setName] = useState(initial.name)
  const [displayName, setDisplayName] = useState(initial.displayName ?? initial.name)
  const [customerId, setCustomerId] = useState(initial.customerId?.toString() ?? '')
  const assignable = new Set(catalog.permissions.filter(permission => permission.isAssignable).map(permission => permission.key))
  const [permissions, setPermissions] = useState(initial.permissions.filter(key => assignable.has(key)))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inherited = mode === 'user' ? catalog.roles.find(role => role.name === name)?.permissions ?? [] : []

  const initialRolePermissions = catalog.roles.find(role => role.name === initial.name)?.permissions ?? []
  const previousAccess = new Set([...initialRolePermissions, ...initial.permissions])
  const currentAccess = new Set([...inherited, ...permissions])
  const added = catalog.permissions.filter(({ key }) => currentAccess.has(key) && !previousAccess.has(key))
  const removed = catalog.permissions.filter(({ key }) => previousAccess.has(key) && !currentAccess.has(key))

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (mode === 'create') {
        await roleRequest('', 'POST', { name: displayName.trim(), permissions })
      } else {
        const path = mode === 'user' ? `/users/${target}` : '/permissions'
        await roleRequest(path, 'PUT', {
          name,
          displayName: mode === 'role' ? displayName.trim() : undefined,
          permissions,
          customerId: mode === 'user' && name === 'Customer' ? Number(customerId) : undefined,
        })
      }
      await onSaved()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save access settings.')
    } finally {
      setSaving(false)
    }
  }

  const title = mode === 'user'
    ? `Edit role and permissions for ${userName ?? 'user'}`
    : mode === 'create' ? 'New role' : `Edit ${roleLabel(initial.name, initial.displayName)} permissions`

  return (
    <UserDialog title={title} busy={saving} onClose={onCancel}>
      <form className={styles.inviteForm} onSubmit={save}>
        <fieldset className={styles.roleFields} disabled={saving}>
          {mode !== 'user' && (
            <label className={styles.inviteField}>Role name
              <input className={styles.inviteInput} required maxLength={100} value={displayName} onChange={event => setDisplayName(event.target.value)} />
            </label>
          )}
          {mode === 'user' && (
            <label className={styles.inviteField}>Role
              <select className={styles.inviteInput} value={name} onChange={event => setName(event.target.value)}>
                {catalog.roles.filter(role => role.name !== 'Superuser').map(role => (
                  <option key={role.name} value={role.name}>{roleLabel(role.name, role.displayName)}</option>
                ))}
              </select>
            </label>
          )}
          {mode === 'user' && name === 'Customer' && (
            <label className={styles.inviteField}>Customer
              <select className={styles.inviteInput} required value={customerId} onChange={event => setCustomerId(event.target.value)}>
                <option value="">Select a customer</option>
                {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
            </label>
          )}
          <fieldset className={styles.permissionGroup}>
            <legend className={styles.inviteLabel}>{mode === 'user' ? 'Direct permissions' : 'Role permissions'}</legend>
            {catalog.permissions.map(permission => (
              <label className={styles.permissionOption} key={permission.key}>
                <input type="checkbox" disabled={!permission.isAssignable}
                  checked={permissions.includes(permission.key)} onChange={event => {
                    setPermissions(current => event.target.checked
                      ? [...current, permission.key]
                      : current.filter(key => key !== permission.key))
                  }} />
                <span className={styles.permissionDetails}>
                  <strong className={styles.permissionTitle}>
                    {permission.name}
                    {!permission.isAssignable && <span className={styles.permissionBadge}>Not assignable</span>}
                  </strong>
                  <code className={styles.permissionKey}>{permission.key}</code>
                  <span>{permission.description}</span>
                  {inherited.includes(permission.key) && (
                    <small className={styles.inviteHint}>Via {roleLabel(name, catalog.roles.find(role => role.name === name)?.displayName)}</small>
                  )}
                </span>
              </label>
            ))}
          </fieldset>
        </fieldset>
        {mode === 'user' && (added.length > 0 || removed.length > 0) && (
          <div className={styles.permissionChanges} role="status">
            {added.length > 0 && <p>Gains {added.map(permission => permission.name).join(', ')}</p>}
            {removed.length > 0 && <p>Loses {removed.map(permission => permission.name).join(', ')}</p>}
          </div>
        )}
        {error && <p className={styles.inviteError} role="alert">{error}</p>}
        <div className={styles.inviteActions}>
          <Button variant="secondary" disabled={saving} onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </form>
    </UserDialog>
  )
}
