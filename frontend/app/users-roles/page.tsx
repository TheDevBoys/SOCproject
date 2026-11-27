'use client'

import { useState, useEffect, type FormEvent } from 'react'

import Sidebar from '../../src/components/layout/Sidebar'
import Button from '../../src/components/ui/Button'
import PageTopbar from '../../src/components/layout/PageTopbar'

import { getUsers } from '../../src/services/users'
import { inviteUser } from '../../src/services/invitation'

import type { CurrentUser } from '../../src/types/auth'
import { roleLabel } from '../../src/types/roleLabels'
import type { User, UserRole } from '../../src/types/user'

import UserActionDialog from './UserActionDialog'
import UserDialog from './UserDialog'
import RoleEditor, { roleRequest, type RoleAccess, type RoleCatalog } from './RoleEditor'
import styles from './page.module.css'

function formatLastSignIn(lastSignIn: string | null): string {
  if (!lastSignIn) {
    return 'Never signed in'
  }

  return new Date(lastSignIn).toLocaleString()
}

type UserActionMenu = { user: User; canEdit: boolean; canEditAccess: boolean; canChangeStatus: boolean; canDelete: boolean }

function RemovalActions({ menu, onSelect }: { menu: UserActionMenu; onSelect: (action: 'status' | 'delete') => void }) {
  return (
    <>
      {menu.canChangeStatus && (
        <Button variant="secondary" className={menu.user.status === 'Active' ? styles.dangerText : undefined}
          onClick={() => onSelect('status')}>
          {menu.user.status === 'Active' ? 'Deactivate user' : 'Reactivate user'}
        </Button>
      )}
      {menu.canDelete && (
        <Button variant="secondary" className={styles.dangerText} onClick={() => onSelect('delete')}>Delete user</Button>
      )}
    </>
  )
}

export default function UsersRolesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([])
  const [catalog, setCatalog] = useState<RoleCatalog | null>(null)
  const [viewedRole, setViewedRole] = useState<RoleAccess | null>(null)
  const [editor, setEditor] = useState<{ mode: 'create' | 'role' | 'user'; initial: RoleAccess; target?: string } | null>(null)
  const [accessError, setAccessError] = useState('')
  const [actionMenu, setActionMenu] = useState<UserActionMenu | null>(null)
  const [removalMenu, setRemovalMenu] = useState<UserActionMenu | null>(null)
  const [userAction, setUserAction] = useState<{ user: User; action: 'edit' | 'delete' | 'status' } | null>(null)
  const [roleMenu, setRoleMenu] = useState<RoleAccess | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<RoleAccess | null>(null)
  const [deletingRole, setDeletingRole] = useState(false)
  const [deleteRoleError, setDeleteRoleError] = useState('')
  const availableRoles = catalog?.roles.map(role => role.name) ?? ['Tier1']

  async function refreshRoleCounts() {
    if (catalog) setCatalog(await roleRequest<RoleCatalog>())
  }

  async function deleteRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!roleToDelete) return

    setDeletingRole(true)
    setDeleteRoleError('')
    try {
      await roleRequest(`/${encodeURIComponent(roleToDelete.name)}`, 'DELETE')
      await refreshAccess()
      setRoleToDelete(null)
    } catch (error) {
      setDeleteRoleError(error instanceof Error ? error.message : 'Could not delete the role.')
    } finally {
      setDeletingRole(false)
    }
  }

  function closeDeleteRole() {
    if (deletingRole) return

    setRoleToDelete(null)
    setDeleteRoleError('')
  }

  async function editUserAccess(user: User) {
    setAccessError('')
    try {
      const initial = await roleRequest<RoleAccess>(`/users/${user.id}`)
      setEditor({ mode: 'user', target: user.id, initial })
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : 'Could not load user access.')
    }
  }

  async function refreshAccess() {
    const [roles, users] = await Promise.all([roleRequest<RoleCatalog>(), getUsers()])
    setCatalog(roles)
    setUsers(users)
    setEditor(null)
  }

  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteCustomer, setInviteCustomer] = useState('')
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

        if (currentUserData.permissions.includes('role.manage')) {
          const [roleCatalog, customerResponse] = await Promise.all([
            roleRequest<RoleCatalog>(),
            fetch('/api/customers', { cache: 'no-store' }),
          ])
          setCatalog(roleCatalog)
          if (customerResponse.ok) setCustomers(await customerResponse.json())
        }

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
        customerId: inviteRole === 'Customer' ? Number(inviteCustomer) : undefined,
      })

      setInviteSuccess(`Invitation successfully sent to ${email}.`)

      setInviteName('')
      setInviteEmail('')
      setInviteRole('Tier1')
      setInviteCustomer('')
      setShowInviteForm(false)

      try {
        const updatedUsers = await getUsers()
        setUsers(updatedUsers)
        setError(null)
        await refreshRoleCounts()
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
              ? roleLabel(currentUser.role, currentUser.roleName)
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

            {accessError && <p role="alert">{accessError}</p>}

            {/* USERS TABLE */}

            {error ? (
              <p role="alert">{error}</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Customer access</th>
                      <th>2FA</th>
                      <th>Last sign-in</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map(user => {
                      const protectedUser = user.role === 'Superuser'
                      const canEdit = currentUser?.permissions.includes('user.update') && (!protectedUser || Boolean(catalog))
                      const canEditAccess = Boolean(catalog) && !protectedUser
                      const canChangeStatus = Boolean(currentUser?.permissions.includes('user.update')) &&
                        currentUser?.id !== user.id && user.status !== 'Invited' &&
                        (!protectedUser || (user.status === 'Inactive' && Boolean(catalog)))
                      const canDelete = currentUser?.permissions.includes('user.delete') && !protectedUser && currentUser.id !== user.id

                      return (
                        <tr key={user.id}>
                          <td className={styles.userName}>
                            {user.name}
                          </td>

                          <td>{user.email}</td>
                          <td>{roleLabel(user.role, user.roleName)}</td>

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
                          <td>
                            {(canEdit || canEditAccess || canChangeStatus || canDelete) && (
                              <button type="button" className={styles.userActions}
                                aria-label={`Actions for ${user.name}`} aria-haspopup="dialog"
                                onClick={() => setActionMenu({ user, canEdit: Boolean(canEdit), canEditAccess, canChangeStatus, canDelete: Boolean(canDelete) })}>
                                ⋯
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {userAction && (
            <UserActionDialog {...userAction} onCancel={() => setUserAction(null)} onSaved={updated => {
              setUsers(current => updated
                ? current.map(user => user.id === userAction.user.id ? updated : user)
                : current.filter(user => user.id !== userAction.user.id))
              setUserAction(null)
              if (!updated) void refreshRoleCounts().catch(() => undefined)
            }} />
          )}

          {actionMenu && (
            <UserDialog title={actionMenu.user.name} description={actionMenu.user.email} onClose={() => setActionMenu(null)}>
              <div className={styles.actionList}>
                {actionMenu.canEdit && (
                  <Button variant="secondary" onClick={() => {
                    setUserAction({ user: actionMenu.user, action: 'edit' })
                    setActionMenu(null)
                  }}>Edit details</Button>
                )}
                {actionMenu.canEditAccess && (
                  <Button variant="secondary" onClick={() => {
                    void editUserAccess(actionMenu.user)
                    setActionMenu(null)
                  }}>Edit role and permissions</Button>
                )}
                {actionMenu.canChangeStatus && actionMenu.canDelete ? (
                  <Button variant="secondary" className={styles.dangerText} onClick={() => {
                    setRemovalMenu(actionMenu)
                    setActionMenu(null)
                  }}>{actionMenu.user.status === 'Active' ? 'Deactivate or delete' : 'Reactivate or delete'}</Button>
                ) : (
                  <RemovalActions menu={actionMenu} onSelect={action => {
                    setUserAction({ user: actionMenu.user, action })
                    setActionMenu(null)
                  }} />
                )}
              </div>
            </UserDialog>
          )}

          {removalMenu && (
            <UserDialog title={`${removalMenu.user.status === 'Active' ? 'Deactivate' : 'Reactivate'} or delete ${removalMenu.user.name}`}
              description={removalMenu.user.email} onClose={() => setRemovalMenu(null)}>
              <div className={styles.actionList}>
                <RemovalActions menu={removalMenu} onSelect={action => {
                  setUserAction({ user: removalMenu.user, action })
                  setRemovalMenu(null)
                }} />
              </div>
            </UserDialog>
          )}

          {catalog && viewedRole && (
            <UserDialog title={`Permissions for ${roleLabel(viewedRole.name, viewedRole.displayName)}`}
              onClose={() => setViewedRole(null)}>
              <dl className={styles.permissionList}>
                {catalog.permissions.filter(permission => viewedRole.permissions.includes(permission.key)).map(permission => (
                  <div className={styles.permissionDetails} key={permission.key}>
                    <dt>
                      {permission.name}
                      {!permission.isAssignable && (
                        <span className={styles.permissionBadge}>Not assignable</span>
                      )}
                    </dt>
                    <dd><code className={styles.permissionKey}>{permission.key}</code></dd>
                    {permission.description && <dd>{permission.description}</dd>}
                  </div>
                ))}
              </dl>
            </UserDialog>
          )}

          {roleMenu && (
            <UserDialog title={roleLabel(roleMenu.name, roleMenu.displayName)} onClose={() => setRoleMenu(null)}>
              <div className={styles.actionList}>
                <Button variant="secondary" onClick={() => {
                  setEditor({ mode: 'role', initial: roleMenu })
                  setRoleMenu(null)
                }}>Edit role and permissions</Button>
                <Button variant="secondary" className={styles.dangerText} disabled={(roleMenu.userCount ?? 0) > 0}
                  onClick={() => {
                    setRoleToDelete(roleMenu)
                    setRoleMenu(null)
                  }}>Delete role</Button>
                {(roleMenu.userCount ?? 0) > 0 && (
                  <p className={styles.inviteHint}>
                    {roleMenu.userCount === 1 ? '1 user has' : `${roleMenu.userCount} users have`} this role.
                    Assign them another role before deleting it.
                  </p>
                )}
              </div>
            </UserDialog>
          )}

          {roleToDelete && (
            <UserDialog title={`Delete ${roleLabel(roleToDelete.name, roleToDelete.displayName)}?`}
              busy={deletingRole} onClose={closeDeleteRole}>
              <form className={styles.inviteForm} onSubmit={deleteRole}>
                <p>This permanently removes the role and its permissions. No users have this role.</p>
                {deleteRoleError && <p role="alert" className={styles.inviteError}>{deleteRoleError}</p>}
                <div className={styles.inviteActions}>
                  <Button variant="secondary" autoFocus disabled={deletingRole} onClick={closeDeleteRole}>Cancel</Button>
                  <Button type="submit" loading={deletingRole} className={styles.dangerButton}>Delete role</Button>
                </div>
              </form>
            </UserDialog>
          )}

          {catalog && editor && (
            <RoleEditor key={editor.target ?? editor.initial.name} {...editor}
              userName={users.find(user => user.id === editor.target)?.name}
              catalog={catalog} customers={customers} onSaved={refreshAccess} onCancel={() => setEditor(null)} />
          )}

          {catalog && (
            <section className={styles.card} aria-labelledby="roles-heading">
              <div className={styles.cardHeader}>
                <h2 id="roles-heading">Roles and permissions</h2>
                <Button type="button" onClick={() => setEditor({ mode: 'create', initial: { name: '', permissions: [] } })}>
                  New role
                </Button>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.permissionsTable}>
                  <thead>
                    <tr><th>Role</th><th>Users</th><th>Permissions</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {catalog.roles.map(role => (
                      <tr key={role.name}>
                        <td>{roleLabel(role.name, role.displayName)}</td>
                        <td>{role.userCount ?? 0}</td>
                        <td>
                          {role.permissions.length ? (
                            <button type="button" className={styles.permissionCount}
                              aria-haspopup="dialog"
                              aria-label={`View permissions for ${roleLabel(role.name, role.displayName)}`}
                              onClick={() => setViewedRole(role)}>
                              {role.permissions.length} {role.permissions.length === 1 ? 'permission' : 'permissions'}
                            </button>
                          ) : '—'}
                        </td>
                        <td>{role.name !== 'Superuser' && (
                          <button type="button" className={styles.userActions}
                            aria-label={`Actions for ${roleLabel(role.name, role.displayName)}`}
                            aria-haspopup="dialog"
                            onClick={() => setRoleMenu(role)}>
                            ⋯
                          </button>
                        )}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* INVITE USER MODAL */}

      {showInviteForm && currentUser?.permissions.includes('user.invite') && (
        <UserDialog title="Invite a new user"
          description="Send an invitation to create an account in the SOC management system."
          busy={inviting} onClose={closeInviteForm}>
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
                  {roleLabel(role, catalog?.roles.find(item => item.name === role)?.displayName)}
                </option>
              ))}
            </select>

            <p className={styles.inviteHint}>
              This role determines the user's permissions.
            </p>
          </div>

          {/* ERROR MESSAGE */}

          {inviteRole === 'Customer' && (
            <label className={styles.inviteField}>
              Customer
              <select className={styles.inviteInput} required disabled={inviting}
                value={inviteCustomer} onChange={event => setInviteCustomer(event.target.value)}>
                <option value="">Select a customer</option>
                {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
            </label>
          )}

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
            <Button variant="secondary"
              type="button"
              disabled={inviting}
              onClick={closeInviteForm}
            >
              Cancel
            </Button>

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
        </UserDialog>
      )}
    </div>
  )
}