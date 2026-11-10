'use client'

import { useState } from 'react'
import Sidebar from '../../src/components/layout/Sidebar'
import Button from '../../src/components/ui/Button'
import styles from './page.module.css'
import PageTopbar from '../../src/components/layout/PageTopbar'

type UserStatus = 'Active' | 'Invited'

type User = {
  name: string
  role: string
  customerAccess: string
  twoFactor: boolean
  lastSignIn: string
  status: UserStatus
}

const users: User[] = [
  { name: 'M. Jansen', role: 'Tier 1 analyst', customerAccess: '14 customers', twoFactor: true, lastSignIn: '06-10 08:02', status: 'Active' },
  { name: 'S. Bakker', role: 'Tier 1 analyst', customerAccess: '14 customers', twoFactor: true, lastSignIn: '06-10 07:58', status: 'Active' }, 
  { name: 'R. Visser', role: 'Tier 2 analyst', customerAccess: '22 customers', twoFactor: true, lastSignIn: '06-10 08:15', status: 'Active'},
  { name: 'L. Smit', role: 'Tier 3 analyst', customerAccess: '31 customers', twoFactor: true, lastSignIn: '05-10 17:48', status: 'Active'},
  { name: 'P. de Wit', role: 'Engineer', customerAccess: 'On request', twoFactor: true, lastSignIn: '06-10 09:01', status: 'Active'},
  { name: 'A. Mulder', role: 'Account manager',customerAccess: '3 customers',twoFactor: true, lastSignIn: '05-10 16:12', status: 'Active'},
  { name: 'K. Hendriks', role: 'Superuser', customerAccess: 'On request, logged', twoFactor: true, lastSignIn: '06-10 08:30', status: 'Active'},
  { name: 'N. Prins', role: 'Forensic analyst (custom)', customerAccess: '2 customers', twoFactor: false, lastSignIn: 'Never signed in', status: 'Invited'},
]

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

export default function UsersRolesPage() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={[ styles.shell, collapsed && styles.collapsedShell,].filter(Boolean).join(' ')}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)}/>
      <div className={styles.workspace}>
        <PageTopbar title="Management / Users & roles" userName="K. Hendriks" userRole="Superuser" twoFactorEnabled={true} sampleData={true} />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <h1>Users & roles</h1>
            <p>Who can do what. Roles set the permissions; the link to customers decides which data someone sees.</p>
          </div>
          <section className={styles.card} aria-labelledby="users-heading">
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <h2 id="users-heading">Users</h2>
                <span className={styles.countBadge}>{users.length}</span>
              </div>
              <Button type="button">Invite user</Button>
            </div>
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
                    <tr key={user.name}>
                      <td className={styles.userName}>{user.name}</td>
                      <td>{user.role}</td>
                      <td>{user.customerAccess}</td>
                      <td><span className={user.twoFactor ? styles.activeBadge : styles.warningBadge}>{user.twoFactor ? 'Active' : 'Not set up'}</span></td>
                      <td className={styles.muted}>{user.lastSignIn}</td>
                      <td>{user.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className={styles.card} aria-labelledby="roles-heading">
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <h2 id="roles-heading">Roles and permissions</h2>
                <span className={styles.subtitle}>Superusers can build custom roles</span>
              </div>
              <Button type="button">New role</Button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.permissionsTable}>
                <thead>
                  <tr>
                    <th>Permission</th>
                    {roles.map(role => (
                      <th key={role}>{role}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map(permission => (
                    <tr key={permission.name}>
                      <td>{permission.name}</td>
                      {permission.roles.map((allowed, index) => (
                        <td key={`${permission.name}-${roles[index]}`}>
                          <span className={allowed ? styles.allowed : styles.denied}>{allowed ? '✓' : '–'}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.cardFooter}>
              <p>Every permission only applies within customers the user has access to (see Customer access).</p>
              <p>* Superusers see customer data only after an access request; every view is logged in the audit log.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}