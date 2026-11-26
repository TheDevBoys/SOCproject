'use client'

import { useState, useEffect, type FormEvent } from 'react'

import Sidebar from '../../src/components/layout/Sidebar'
import Button from '../../src/components/ui/Button'
import PageTopbar from '../../src/components/layout/PageTopbar'

import { getUsers } from '../../src/services/users'
import { inviteUser } from '../../src/services/invitation'

import type { CurrentUser } from '../../src/types/auth'
import type { User, UserRole } from '../../src/types/user'

import styles from './page.module.css'

type Permission = {
  name: string
  roles: boolean[]
}

const permissions: Permission[] = [
  { name: 'View alerts', roles: [true, true, true, true, false, true, true] },
  { name: 'Triage alerts (close or promote)', roles: [true, true, true, false, false, false, false] },
  { name: 'Create case', roles: [true, true, true, false, false, false, false] },
  { name: 'View cases', roles: [true, true, true, true, true, true, true] },
  { name: 'Escalate case', roles: [true, true, false, false, false, false, false] },
  { name: 'Close case', roles: [false, true, true, false, false, false, false] },
  { name: 'Download evidence', roles: [false, true, true, false, false, false, true] },
  { name: 'Manage customers', roles: [false, false, false, false, true, true, false] },
  { name: 'Grant customer access', roles: [false, false, false, false, false, true, false] },
  { name: 'Manage users and roles', roles: [false, false, false, false, false, true, false] },
  { name: 'Change retention policy', roles: [false, false, false, false, false, true, false] },
  { name: 'View audit log', roles: [false, false, true, false, false, true, false] },
  { name: 'View reports', roles: [false, false, false, false, true, true, false] },
]

const roles = [
  'Tier 1',
  'Tier 2',
  'Tier 3',
  'Engineer',
  'Account manager',
  'Superuser',
  'Forensics',
]

const roleLabels: Record<UserRole, string> = {
  Superuser: 'Superuser',
  Tier1: 'Tier 1 analyst',
  Tier2: 'Tier 2 analyst',
  Tier3: 'Tier 3 analyst',
  Engineer: 'Engineer',
  AccountManager: 'Account manager',
  ForensicAnalyst: 'Forensic analyst',
  Customer: 'Customer',
}

const availableRoles = Object.keys(roleLabels) as UserRole[]

function formatLastSignIn(lastSignIn: string | null): string {
  if (!lastSignIn) {
    return 'Never signed in'
  }

  return new Date(lastSignIn).toLocaleString()
}

export default function UsersRolesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('Tier1')

  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const currentUserResponse = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        })

        if (!currentUserResponse.ok) {
          throw new Error('Could not load current user.')
        }

        const currentUserData: CurrentUser = await currentUserResponse.json()
        setCurrentUser(currentUserData)

        if (currentUserData.permissions.includes('user.read')) {
          setUsers(await getUsers())
        }
      } catch (error) {
        console.error('Failed to load page data:', error)
        setError('Could not load user information.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  function closeInviteForm() {
    if (inviting) return

    setShowInviteForm(false)
    setInviteError(null)
  }

  function toggleInviteForm() {
    setShowInviteForm(value => !value)
    setInviteError(null)
  }

  useEffect(() => {
    if (!showInviteForm) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !inviting) {
        setShowInviteForm(false)
        setInviteError(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showInviteForm, inviting])

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (inviting) return

    setInviteError(null)
    setInviteSuccess(null)
    setInviting(true)

    const email = inviteEmail.trim()

    try {
      await inviteUser({
        name: inviteName.trim(),
        email,
        role: inviteRole,
      })

      setInviteSuccess(`Invitation successfully sent to ${email}.`)

      setInviteName('')
      setInviteEmail('')
      setInviteRole('Tier1')
      setShowInviteForm(false)

      try {
        const updatedUsers = await getUsers()
        setUsers(updatedUsers)
        setError(null)
      } catch (refreshError) {
        console.error('Failed to refresh users:', refreshError)
      }
    } catch (error) {
      console.error('Failed to invite user:', error)

      setInviteError(
        error instanceof Error
          ? error.message
          : 'Could not send invitation.'
      )
    } finally {
      setInviting(false)
    }
  }

  if (!loading && !currentUser?.permissions.includes('user.read')) {
    return <main><p role="alert">{error ?? 'You do not have access to Users & Roles.'}</p></main>
  }

  if (loading) {
    return <main><p role="status">Loading users…</p></main>
  }

  return (
    <div
      className={[
        styles.shell,
        collapsed && styles.collapsedShell,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(value => !value)}
      />

      <div className={styles.workspace}>
        <PageTopbar
          title="Management / Users & roles"
          userName={currentUser?.name ?? ''}
          userRole={
            currentUser
              ? roleLabels[currentUser.role]
              : ''
          }
          twoFactorEnabled={currentUser?.mfaEnabled ?? false}
          sampleData={false}
        />

        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <h1>Users & roles</h1>

            <p>
              Who can do what. Roles set the permissions;
              the link to customers decides which data someone sees.
            </p>
          </div>

          {/* USERS */}

          <section
            className={styles.card}
            aria-labelledby="users-heading"
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <h2 id="users-heading">Users</h2>

                <span className={styles.countBadge}>
                  {users.length}
                </span>
              </div>

              {currentUser?.permissions.includes('user.invite') && (
                <Button
                  type="button"
                  onClick={toggleInviteForm}
                >
                  Invite user
                </Button>
              )}
            </div>

            {/* SUCCESS MESSAGE */}

            {inviteSuccess && (
              <p
                role="status"
                className={styles.inviteSuccess}
              >
                {inviteSuccess}
              </p>
            )}

            {/* USERS TABLE */}

            {error ? (
              <p role="alert">{error}</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Customer access</th>
                      <th>2FA</th>
                      <th>Last sign-in</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className={styles.userName}>
                          {user.name}
                        </td>

                        <td>
                          {roleLabels[user.role]}
                        </td>

                        <td>
                          {user.customerAccess}
                        </td>

                        <td>
                          <span
                            className={
                              user.twoFactor
                                ? styles.activeBadge
                                : styles.warningBadge
                            }
                          >
                            {user.twoFactor
                              ? 'Active'
                              : 'Not set up'}
                          </span>
                        </td>

                        <td className={styles.muted}>
                          {formatLastSignIn(user.lastSignIn)}
                        </td>

                        <td>{user.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ROLES AND PERMISSIONS */}

          <section
            className={styles.card}
            aria-labelledby="roles-heading"
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <h2 id="roles-heading">
                  Roles and permissions
                </h2>

                <span className={styles.subtitle}>
                  Superusers can build custom roles
                </span>
              </div>

              <Button type="button">
                New role
              </Button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.permissionsTable}>
                <thead>
                  <tr>
                    <th>Permission</th>

                    {roles.map(role => (
                      <th key={role}>
                        {role}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {permissions.map(permission => (
                    <tr key={permission.name}>
                      <td>{permission.name}</td>

                      {permission.roles.map((allowed, index) => (
                        <td
                          key={`${permission.name}-${roles[index]}`}
                        >
                          <span
                            className={
                              allowed
                                ? styles.allowed
                                : styles.denied
                            }
                          >
                            {allowed ? '✓' : '–'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.cardFooter}>
              <p>
                Every permission only applies within customers
                the user has access to (see Customer access).
              </p>

              <p>
                * Superusers see customer data only after an
                access request; every view is logged in the audit log.
              </p>
            </div>
          </section>
        </main>
      </div>

      {/* INVITE USER MODAL */}

      {showInviteForm && currentUser?.permissions.includes('user.invite') && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              closeInviteForm()
            }
          }}
        >
          <section
            className={styles.inviteModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
            aria-describedby="invite-modal-description"
          >
            {/* MODAL HEADER */}

            <div className={styles.inviteModalHeader}>
              <div>
                <h2
                  id="invite-modal-title"
                  className={styles.inviteModalTitle}
                >
                  Invite a new user
                </h2>

                <p
                  id="invite-modal-description"
                  className={styles.inviteModalDescription}
                >
                  Send an invitation to create an account
                  in the SOC management system.
                </p>
              </div>

              <button
                type="button"
                className={styles.inviteCloseButton}
                aria-label="Close invitation"
                disabled={inviting}
                onClick={closeInviteForm}
              >
                ×
              </button>
            </div>

            {/* INVITATION FORM */}

            <form
              onSubmit={handleInvite}
              className={styles.inviteForm}
            >
              {/* FULL NAME */}

              <div className={styles.inviteField}>
                <label
                  htmlFor="invite-name"
                  className={styles.inviteLabel}
                >
                  Full name
                </label>

                <input
                  id="invite-name"
                  className={styles.inviteInput}
                  type="text"
                  value={inviteName}
                  onChange={event =>
                    setInviteName(event.target.value)
                  }
                  required
                  maxLength={100}
                  autoComplete="name"
                  disabled={inviting}
                  placeholder="Enter full name"
                  autoFocus
                />
              </div>

              {/* EMAIL */}

              <div className={styles.inviteField}>
                <label
                  htmlFor="invite-email"
                  className={styles.inviteLabel}
                >
                  Email address
                </label>

                <input
                  id="invite-email"
                  className={styles.inviteInput}
                  type="email"
                  value={inviteEmail}
                  onChange={event =>
                    setInviteEmail(event.target.value)
                  }
                  required
                  autoComplete="email"
                  disabled={inviting}
                  placeholder="name@company.com"
                />

                <p className={styles.inviteHint}>
                  An invitation link will be sent to this address.
                </p>
              </div>

              {/* ROLE */}

              <div className={styles.inviteField}>
                <label
                  htmlFor="invite-role"
                  className={styles.inviteLabel}
                >
                  User role
                </label>

                <select
                  id="invite-role"
                  className={styles.inviteInput}
                  value={inviteRole}
                  onChange={event =>
                    setInviteRole(event.target.value as UserRole)
                  }
                  required
                  disabled={inviting}
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>

                <p className={styles.inviteHint}>
                  This role determines the user's permissions.
                </p>
              </div>

              {/* ERROR MESSAGE */}

              {inviteError && (
                <p
                  role="alert"
                  className={styles.inviteError}
                >
                  {inviteError}
                </p>
              )}

              {/* ACTION BUTTONS */}

              <div className={styles.inviteActions}>
                <button
                  type="button"
                  className={styles.inviteCancelButton}
                  disabled={inviting}
                  onClick={closeInviteForm}
                >
                  Cancel
                </button>

                <Button
                  type="submit"
                  disabled={inviting}
                >
                  {inviting
                    ? 'Sending invitation...'
                    : 'Send invitation'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}