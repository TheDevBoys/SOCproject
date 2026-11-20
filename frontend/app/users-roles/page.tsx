'use client'

import { useState, useEffect } from 'react'

import Sidebar from '../../src/components/layout/Sidebar'
import Button from '../../src/components/ui/Button'
import PageTopbar from '../../src/components/layout/PageTopbar'

import { getUsers } from '../../src/services/users'
import { inviteUser } from '../../src/services/invitation'

import type { User, UserRole } from '../../src/types/user'

import styles from './page.module.css'

type Permission = {
  name: string
  roles: boolean[]
}

type CurrentUser = {
  id: string
  name: string
  email: string
  role: UserRole
  twoFactor: boolean
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

  // Load users and current authenticated user
  useEffect(() => {
    async function loadData() {
      try {
        const [usersResponse, currentUserResponse] = await Promise.all([
          getUsers(),
          fetch('/api/auth/me', {
            credentials: 'include',
            cache: 'no-store',
          }),
        ])

        setUsers(usersResponse)

        if (!currentUserResponse.ok) {
          throw new Error('Could not load current user.')
        }

        const currentUserData: CurrentUser =
          await currentUserResponse.json()

        setCurrentUser(currentUserData)
      } catch (error) {
        console.error('Failed to load page data:', error)
        setError('Could not load user information.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  function toggleInviteForm() {
    setShowInviteForm(value => !value)
    setInviteError(null)
    setInviteSuccess(null)
  }

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (inviting) {
      return
    }

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

      setInviteSuccess(`Invitation sent to ${email}.`)

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
          twoFactorEnabled={currentUser?.twoFactor ?? false}
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

              {currentUser?.role === 'Superuser' && (
                <Button
                  type="button"
                  onClick={toggleInviteForm}
                >
                  {showInviteForm
                    ? 'Cancel invitation'
                    : 'Invite user'}
                </Button>
              )}
            </div>

            {/* SUCCESS MESSAGE */}

            {inviteSuccess && (
              <p
                role="status"
                style={{
                  color: '#16803c',
                  margin: '12px 0',
                }}
              >
                {inviteSuccess}
              </p>
            )}

            {/* INVITATION FORM */}

            {showInviteForm && currentUser?.role === 'Superuser' && (
              <form
                onSubmit={handleInvite}
                style={{
                  display: 'grid',
                  gap: 12,
                  maxWidth: 440,
                  margin: '16px 0 24px',
                }}
              >
                <h3>Invite a new user</h3>

                <label htmlFor="invite-name">
                  Name
                </label>

                <input
                  id="invite-name"
                  type="text"
                  value={inviteName}
                  onChange={event =>
                    setInviteName(event.target.value)
                  }
                  required
                  maxLength={100}
                  autoComplete="name"
                  disabled={inviting}
                  style={{ padding: 10 }}
                />

                <label htmlFor="invite-email">
                  Email
                </label>

                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={event =>
                    setInviteEmail(event.target.value)
                  }
                  required
                  autoComplete="email"
                  disabled={inviting}
                  style={{ padding: 10 }}
                />

                <label htmlFor="invite-role">
                  Role
                </label>

                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={event =>
                    setInviteRole(event.target.value as UserRole)
                  }
                  required
                  disabled={inviting}
                  style={{ padding: 10 }}
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>

                {inviteError && (
                  <p
                    role="alert"
                    style={{ color: '#b42318' }}
                  >
                    {inviteError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={inviting}
                >
                  {inviting
                    ? 'Sending invitation...'
                    : 'Send invitation'}
                </Button>
              </form>
            )}

            {/* USERS TABLE */}

            {loading ? (
              <p>Loading users...</p>
            ) : error ? (
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
    </div>
  )
}