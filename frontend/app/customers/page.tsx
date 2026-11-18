'use client'

import { useState, type FormEvent } from 'react'
import Sidebar from '../../src/components/layout/Sidebar'
import PageTopbar from '../../src/components/layout/PageTopbar'
import Button from '../../src/components/ui/Button'
import Card from '../../src/components/ui/Card'
import DropDown from '../../src/components/ui/DropDown'
import TextField from '../../src/components/ui/TextField'
import SelectField from '../../src/components/ui/SelectField'
import styles from './page.module.css'
import type { Customer, CustomerStatus, DataIsolation } from '../../src/types/customer'

const sampleCustomers: Customer[] = [
  { id: 1, name: 'Bank Alpha', sector: 'Bank', dataIsolation: 'OwnDatabase', slaProfile: 'Premium 24/7', retentionDays: 90, dataResidency: 'Netherlands', contactName: 'J. Peeters', contactEmail: 'j.peeters@bankalpha.example', status: 'Active' },
  { id: 2, name: 'Care Beta', sector: 'Healthcare', dataIsolation: 'OwnDatabase', slaProfile: 'Premium 24/7', retentionDays: 90, dataResidency: 'Netherlands', contactName: 'M. de Vries', contactEmail: 'm.devries@carebeta.example', status: 'Active' },
  { id: 3, name: 'Municipality Gamma', sector: 'Government', dataIsolation: 'OwnSchema', slaProfile: 'Standard, office hours', retentionDays: 90, dataResidency: 'Netherlands', contactName: 'H. Smit', contactEmail: 'h.smit@gamma.example', status: 'Active' },
  { id: 4, name: 'Logistics Delta', sector: 'Logistics', dataIsolation: 'SharedRowLevelSecurity', slaProfile: 'Standard, office hours', retentionDays: 90, dataResidency: 'Netherlands', contactName: 'E. Bakker', contactEmail: 'e.bakker@logisticsdelta.example', status: 'Active' },
  { id: 5, name: 'Retail Epsilon', sector: 'Retail', dataIsolation: 'SharedRowLevelSecurity', slaProfile: 'Standard, office hours', retentionDays: 90, dataResidency: 'Netherlands', contactName: 'S. Meijer', contactEmail: 's.meijer@retailepsilon.example', status: 'Active' },
  { id: 6, name: 'Energy Zeta', sector: 'Energy', dataIsolation: 'OwnSchema', slaProfile: 'Premium 24/7', retentionDays: 90, dataResidency: 'Netherlands', contactName: 'T. Visser', contactEmail: 't.visser@energyzeta.example', status: 'Active' },
  { id: 7, name: 'Education Eta', sector: 'Education', dataIsolation: 'SharedRowLevelSecurity', slaProfile: 'Basic, office hours', retentionDays: 30, dataResidency: 'Netherlands', contactName: 'L. de Groot', contactEmail: 'l.degroot@educationeta.example', status: 'Onboarding' },
  { id: 8, name: 'Insurer Theta', sector: 'Insurance', dataIsolation: 'OwnDatabase', slaProfile: 'Premium 24/7', retentionDays: 90, dataResidency: 'Netherlands', contactName: 'A. Mulder', contactEmail: 'a.mulder@insurertheta.example', status: 'Active' },
  { id: 9, name: 'Transport Iota', sector: 'Logistics', dataIsolation: 'SharedRowLevelSecurity', slaProfile: 'Basic, office hours', retentionDays: 30, dataResidency: 'Netherlands', contactName: 'R. Bos', contactEmail: 'r.bos@transportiota.example', status: 'Inactive' },
]

const emptyCustomer: Customer = {
  id: 0,
  name: '',
  sector: 'Bank',
  dataIsolation: 'SharedRowLevelSecurity',
  slaProfile: 'Standard, office hours',
  retentionDays: 90,
  dataResidency: 'Netherlands',
  contactName: '',
  contactEmail: '',
  status: 'Onboarding',
}

const sectors = ['Bank', 'Healthcare', 'Government', 'Logistics', 'Retail', 'Energy', 'Education', 'Insurance']

const slaProfiles = ['Premium 24/7', 'Standard, office hours', 'Basic, office hours']

const dataIsolationLabels: Record<DataIsolation, string> = {
  SharedRowLevelSecurity: 'Shared, row-level security',
  OwnSchema: 'Own schema',
  OwnDatabase: 'Own database',
}

const statusBadges: Record<CustomerStatus, string> = {
  Active: styles.activeBadge,
  Onboarding: styles.warningBadge,
  Inactive: styles.inactiveBadge,
}

type FormErrors = {
  name?: string
  contactEmail?: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers)
  const [form, setForm] = useState<Customer>(sampleCustomers[0])
  const [errors, setErrors] = useState<FormErrors>({})
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('all')
  const [status, setStatus] = useState('all')
  const [collapsed, setCollapsed] = useState(false)

  const isNew = form.id === 0

  const visibleCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) &&
    (sector === 'all' || customer.sector === sector) &&
    (status === 'all' || customer.status === status)
  )

  function selectCustomer(customer: Customer) {
    setForm(customer)
    setErrors({})
  }

  function addCustomer() {
    setForm(emptyCustomer)
    setErrors({})
  }

  function updateField(field: keyof Customer, value: string | number) {
    setForm({ ...form, [field]: value })
  }

  function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const newErrors: FormErrors = {}

    if (form.name.trim() === '') {
      newErrors.name = 'Name is required.'
    }

    if (!form.contactEmail.includes('@')) {
      newErrors.contactEmail = 'Enter a valid email address.'
    }

    setErrors(newErrors)

    if (newErrors.name || newErrors.contactEmail) {
      return
    }

    if (isNew) {
      const newCustomer = { ...form, id: customers.length + 1 }
      setCustomers([...customers, newCustomer])
      setForm(newCustomer)
    } else {
      setCustomers(customers.map(customer => (customer.id === form.id ? form : customer)))
    }
  }

  function cancelEdit() {
    setForm(customers.find(customer => customer.id === form.id) || emptyCustomer)
    setErrors({})
  }

  function deactivateCustomer() {
    if (!window.confirm(`Deactivate ${form.name}? The customer stays in the list as Inactive.`)) {
      return
    }

    const savedCustomer = customers.find(customer => customer.id === form.id)
    const deactivatedCustomer: Customer = { ...savedCustomer, status: 'Inactive' }

    setCustomers(customers.map(customer => (customer.id === form.id ? deactivatedCustomer : customer)))
    setForm(deactivatedCustomer)
  }

  return (
    <div className={[styles.shell, collapsed && styles.collapsedShell].filter(Boolean).join(' ')}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
      <div className={styles.workspace}>
        <PageTopbar title="Management / Customers" userName="K. Hendriks" userRole="Superuser" twoFactorEnabled={true} sampleData={true} />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Customers</h1>
              <p>A customer is the boundary for data, permissions and SLA. About 600 customers; the list shows {visibleCustomers.length}.</p>
            </div>
            <Button type="button" onClick={addCustomer}>Add customer</Button>
          </div>

          <div className={styles.layout}>
            <section className={styles.card} aria-label="Customer list">
              <div className={styles.filters}>
                <input
                  type="search"
                  className={styles.search}
                  placeholder="Search customers"
                  aria-label="Search customers"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                />
                <DropDown aria-label="Sector filter" value={sector} onChange={event => setSector(event.target.value)}>
                  <option value="all">All sectors</option>
                  {sectors.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </DropDown>
                <DropDown aria-label="Status filter" value={status} onChange={event => setStatus(event.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Inactive">Inactive</option>
                </DropDown>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Sector</th>
                      <th>Data isolation</th>
                      <th>SLA profile</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCustomers.map(customer => (
                      <tr
                        key={customer.id}
                        className={[customer.id === form.id && styles.selectedRow, customer.status === 'Inactive' && styles.inactiveRow].filter(Boolean).join(' ')}
                      >
                        <td>
                          <button type="button" className={styles.customerName} onClick={() => selectCustomer(customer)}>
                            {customer.name}
                          </button>
                        </td>
                        <td>{customer.sector}</td>
                        <td>{dataIsolationLabels[customer.dataIsolation]}</td>
                        <td>{customer.slaProfile}</td>
                        <td><span className={statusBadges[customer.status]}>{customer.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {visibleCustomers.length === 0 && <p className={styles.empty}>No customers found.</p>}
            </section>

            <Card title={isNew ? 'New customer' : 'Edit customer'} titleId="customer-form-title" subtitle={isNew ? undefined : form.name}>
              <form className={styles.form} onSubmit={saveCustomer} noValidate>
                <TextField id="customer-name" label="Name" value={form.name} onChange={event => updateField('name', event.target.value)} error={errors.name} />
                <SelectField id="customer-sector" label="Sector" value={form.sector} onChange={event => updateField('sector', event.target.value)}>
                  {sectors.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </SelectField>
                <fieldset className={styles.isolation}>
                  <legend>Data isolation</legend>
                  {Object.entries(dataIsolationLabels).map(([value, label]) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="dataIsolation"
                        value={value}
                        checked={form.dataIsolation === value}
                        onChange={() => updateField('dataIsolation', value)}
                      />
                      {label}
                    </label>
                  ))}
                  <p>Banks and healthcare providers often have stricter data separation rules. Changing this requires a migration.</p>
                </fieldset>
                <SelectField id="customer-sla" label="SLA profile" value={form.slaProfile} onChange={event => updateField('slaProfile', event.target.value)}>
                  {slaProfiles.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </SelectField>
                <SelectField id="customer-retention" label="Default retention period" value={form.retentionDays} onChange={event => updateField('retentionDays', Number(event.target.value))}>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                </SelectField>
                <TextField id="customer-residency" label="Data residency" value={form.dataResidency} onChange={event => updateField('dataResidency', event.target.value)} />
                <TextField id="customer-contact-name" label="Contact name" value={form.contactName} onChange={event => updateField('contactName', event.target.value)} />
                <TextField id="customer-contact-email" label="Contact email" type="email" value={form.contactEmail} onChange={event => updateField('contactEmail', event.target.value)} error={errors.contactEmail} />
                <div className={styles.actions}>
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="secondary" onClick={cancelEdit}>Cancel</Button>
                  {!isNew && form.status !== 'Inactive' && (
                    <Button type="button" variant="secondary" onClick={deactivateCustomer}>Deactivate customer</Button>
                  )}
                </div>
                <p className={styles.note}>Changes are recorded in the audit log with name and time.</p>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
