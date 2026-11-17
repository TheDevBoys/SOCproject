'use client'

import { useState } from 'react'
import Sidebar from '../../src/components/layout/Sidebar'
import PageTopbar from '../../src/components/layout/PageTopbar'
import Button from '../../src/components/ui/Button'
import DropDown from '../../src/components/ui/DropDown'
import styles from './page.module.css'
import type { AccessLevel, AccessRequest, CustomerAccess } from '../../src/types/customerAccess'

const users = [
  { id: 1, name: 'M. Jansen', role: 'Tier 1 analyst' },
  { id: 2, name: 'S. Bakker', role: 'Tier 1 analyst' },
  { id: 3, name: 'R. Visser', role: 'Tier 2 analyst' },
  { id: 4, name: 'L. Smit', role: 'Tier 3 analyst' },
  { id: 5, name: 'P. de Wit', role: 'Engineer' },
  { id: 6, name: 'A. Mulder', role: 'Account manager' },
  { id: 7, name: 'K. Hendriks', role: 'Superuser' },
  { id: 8, name: 'N. Prins', role: 'Forensic analyst' },
]

const customers = ['Bank Alpha', 'Care Beta', 'Insurer Theta', 'Municipality Gamma', 'Logistics Delta', 'Retail Epsilon', 'Energy Zeta', 'Education Eta']

const sampleAccess: CustomerAccess[] = [
  { userId: 1, customer: 'Bank Alpha', access: 'FullAccess', expires: 'permanent', grantedBy: 'K. Hendriks' },
  { userId: 1, customer: 'Retail Epsilon', access: 'FullAccess', expires: 'permanent', grantedBy: 'K. Hendriks' },
  { userId: 2, customer: 'Logistics Delta', access: 'FullAccess', expires: 'permanent', grantedBy: 'K. Hendriks' },
  { userId: 2, customer: 'Energy Zeta', access: 'FullAccess', expires: 'permanent', grantedBy: 'K. Hendriks' },
  { userId: 3, customer: 'Bank Alpha', access: 'FullAccess', expires: 'permanent', grantedBy: 'K. Hendriks' },
  { userId: 3, customer: 'Care Beta', access: 'FullAccess', expires: 'permanent', grantedBy: 'K. Hendriks' },
  { userId: 3, customer: 'Municipality Gamma', access: 'FullAccess', expires: 'permanent', grantedBy: 'K. Hendriks' },
  { userId: 4, customer: 'Care Beta', access: 'FullAccess', expires: 'permanent', grantedBy: 'K. Hendriks' },
  { userId: 4, customer: 'Insurer Theta', access: 'FullAccess', expires: 'permanent', grantedBy: 'K. Hendriks' },
  { userId: 5, customer: 'Logistics Delta', access: 'ReadOnly', expires: 'permanent', grantedBy: 'K. Hendriks' },
  { userId: 6, customer: 'Bank Alpha', access: 'ReadOnly', expires: 'permanent', grantedBy: 'K. Hendriks' },
  { userId: 6, customer: 'Care Beta', access: 'ReadOnly', expires: 'permanent', grantedBy: 'K. Hendriks' },
  { userId: 6, customer: 'Insurer Theta', access: 'ReadOnly', expires: '31-12-2026', grantedBy: 'K. Hendriks' },
]

const sampleRequests: AccessRequest[] = [
  { id: 1, userId: 5, customer: 'Bank Alpha', reason: 'investigate ingest error in alert parser', duration: '2 hours' },
  { id: 2, userId: 2, customer: 'Retail Epsilon', reason: 'cover for a sick colleague', duration: '8 hours' },
  { id: 3, userId: 8, customer: 'Care Beta', reason: 'forensic investigation CASE-2026-0149', duration: 'until the case closes' },
]

const accessLabels: Record<AccessLevel, string> = {
  NoAccess: 'No access',
  ReadOnly: 'Read only',
  FullAccess: 'Full access',
}

const accessBadges: Record<AccessLevel, string> = {
  NoAccess: styles.noAccessBadge,
  ReadOnly: styles.readOnlyBadge,
  FullAccess: styles.activeBadge,
}

export default function CustomerAccessPage() {
  const [accessList, setAccessList] = useState<CustomerAccess[]>(sampleAccess)
  const [requests, setRequests] = useState<AccessRequest[]>(sampleRequests)
  const [selectedUserId, setSelectedUserId] = useState(6)
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState(false)

  const selectedUser = users.find(user => user.id === selectedUserId)
  const visibleUsers = users.filter(user => user.name.toLowerCase().includes(search.toLowerCase()))

  function findUser(userId: number) {
    return users.find(user => user.id === userId)
  }

  function findAccess(customer: string) {
    return accessList.find(item => item.userId === selectedUserId && item.customer === customer)
  }

  function saveAccess(newAccess: CustomerAccess) {
    const otherAccess = accessList.filter(item => !(item.userId === newAccess.userId && item.customer === newAccess.customer))
    setAccessList(newAccess.access === 'NoAccess' ? otherAccess : [...otherAccess, newAccess])
  }

  function selectUser(userId: number) {
    setSelectedUserId(userId)
    setEditingCustomer(null)
  }

  function changeAccess(customer: string, access: AccessLevel) {
    const current = findAccess(customer)

    saveAccess({
      userId: selectedUserId,
      customer,
      access,
      expires: current ? current.expires : 'permanent',
      grantedBy: 'K. Hendriks',
    })
    setEditingCustomer(null)
  }

  function approveRequest(request: AccessRequest) {
    saveAccess({
      userId: request.userId,
      customer: request.customer,
      access: 'ReadOnly',
      expires: request.duration,
      grantedBy: 'K. Hendriks',
    })
    setRequests(requests.filter(item => item.id !== request.id))
    selectUser(request.userId)
  }

  function rejectRequest(request: AccessRequest) {
    setRequests(requests.filter(item => item.id !== request.id))
  }

  return (
    <div className={[styles.shell, collapsed && styles.collapsedShell].filter(Boolean).join(' ')}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
      <div className={styles.workspace}>
        <PageTopbar title="Management / Customer access" userName="K. Hendriks" userRole="Superuser" twoFactorEnabled={true} sampleData={true} />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <h1>Customer access</h1>
            <p>Decide which customers a user can see. Access is requested and granted here instead of by email.</p>
          </div>

          <section className={[styles.card, styles.requests].join(' ')} aria-labelledby="requests-heading">
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <h2 id="requests-heading">Open access requests</h2>
                <span className={styles.requestCount}>{requests.length}</span>
              </div>
            </div>
            {requests.length === 0 ? (
              <p className={styles.empty}>No open access requests.</p>
            ) : (
              <ul className={styles.requestList}>
                {requests.map(request => {
                  const user = findUser(request.userId)

                  return (
                    <li key={request.id} className={styles.request}>
                      <div>
                        <p>
                          <strong>{user.name}</strong> <span className={styles.muted}>({user.role})</span> requests access to <strong>{request.customer}</strong>
                        </p>
                        <p className={styles.reason}>Reason: {request.reason} · Duration: {request.duration}</p>
                      </div>
                      <div className={styles.actions}>
                        <Button type="button" onClick={() => approveRequest(request)}>Approve</Button>
                        <Button type="button" variant="secondary" onClick={() => rejectRequest(request)}>Reject</Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <div className={styles.layout}>
            <section className={styles.card} aria-labelledby="users-heading">
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <h2 id="users-heading">User</h2>
                </div>
              </div>
              <div className={styles.userSearch}>
                <input
                  type="search"
                  className={styles.search}
                  placeholder="Search users"
                  aria-label="Search users"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                />
              </div>
              <ul className={styles.userList}>
                {visibleUsers.map(user => (
                  <li key={user.id}>
                    <button
                      type="button"
                      className={[styles.userButton, user.id === selectedUserId && styles.selectedUser].filter(Boolean).join(' ')}
                      aria-pressed={user.id === selectedUserId}
                      onClick={() => selectUser(user.id)}
                    >
                      <strong>{user.name}</strong>
                      <span>{user.role}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {visibleUsers.length === 0 && <p className={styles.empty}>No users found.</p>}
            </section>

            <section className={styles.card} aria-labelledby="access-heading">
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <h2 id="access-heading">Access for {selectedUser.name}</h2>
                  <span className={styles.subtitle}>{selectedUser.role}</span>
                </div>
                <Button type="button" aria-disabled="true">Add customer</Button>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Access</th>
                      <th>Expires</th>
                      <th>Granted by</th>
                      <th><span className={styles.visuallyHidden}>Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(customer => {
                      const access = findAccess(customer)
                      const level = access ? access.access : 'NoAccess'

                      return (
                        <tr key={customer}>
                          <td className={styles.customerName}>{customer}</td>
                          <td>
                            {editingCustomer === customer ? (
                              <DropDown
                                aria-label={`Access to ${customer}`}
                                value={level}
                                onChange={event => changeAccess(customer, event.target.value as AccessLevel)}
                              >
                                {Object.entries(accessLabels).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </DropDown>
                            ) : (
                              <span className={accessBadges[level]}>{accessLabels[level]}</span>
                            )}
                          </td>
                          <td className={styles.muted}>{access ? access.expires : '–'}</td>
                          <td className={styles.muted}>{access ? access.grantedBy : '–'}</td>
                          <td className={styles.editCell}>
                            {editingCustomer === customer ? (
                              <button type="button" className={styles.linkButton} onClick={() => setEditingCustomer(null)}>Done</button>
                            ) : (
                              <button type="button" className={styles.linkButton} onClick={() => setEditingCustomer(customer)} aria-label={`Edit access to ${customer}`}>Edit</button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className={styles.cardFooter}>
                <p>Without access a user sees nothing of a customer: no alerts, cases, attachments or chat messages. Every change is logged in the audit log.</p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
