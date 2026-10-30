import Link from 'next/link'
import Icon, { type IconName } from '../ui/Icon'
import styles from './Sidebar.module.css'

const groups: { title: string; items: { label: string; roles: string; icon: IconName }[] }[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'Dashboard', roles: 'all roles', icon: 'dashboard' },
      { label: 'Alert queue', roles: 'Tier 1–3, engineer, forensics', icon: 'bell' },
      { label: 'Cases', roles: 'all roles', icon: 'folder' },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Customers', roles: 'account manager, superuser', icon: 'building' },
      { label: 'Users & roles', roles: 'superuser', icon: 'users' },
      { label: 'Customer access', roles: 'superuser', icon: 'key' },
      { label: 'Retention policy', roles: 'superuser', icon: 'clock' },
      { label: 'Audit log', roles: 'Tier 3, superuser', icon: 'list' },
    ],
  },
  {
    title: 'Reporting',
    items: [{ label: 'SOC reports', roles: 'account manager, superuser', icon: 'chart' }],
  },
]

type SidebarProps = {
  collapsed?: boolean
  onToggle?: () => void
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  return (
    <aside className={[styles.sidebar, collapsed && styles.collapsed].filter(Boolean).join(' ')}>
      <div className={styles.brand}>
        <span className={styles.brandIcon} aria-hidden="true">{'</>'}</span>
        <span className={styles.brandName}><span className={styles.accent}>Dev</span>Boys</span>
      </div>
      <button
        type="button"
        className={styles.collapse}
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-controls="main-navigation"
        aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
        title={collapsed ? 'Expand menu' : 'Collapse menu'}
      >
        <Icon name="collapse" />
        <span className={styles.menuLabel}>Collapse menu</span>
      </button>
      <nav id="main-navigation" className={styles.navigation} aria-label="Main navigation">
        {groups.map(group => (
          <section key={group.title} className={styles.group} aria-label={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.items.map(item => (
                <li key={item.label}>
                  <button type="button" className={styles.item} aria-disabled="true" aria-label={item.label} title={item.label}>
                    <Icon name={item.icon} />
                    <span className={styles.itemLabel}>{item.label}<small>[{item.roles}]</small></span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <Link href="/account" className={`${styles.item} ${styles.active}`} aria-current="location" aria-label="My account" title="My account">
          <Icon name="user" />
          <span className={styles.itemLabel}>My account<small>[all roles]</small></span>
        </Link>
      </nav>
      <p className={styles.note}>
        Brackets show which roles can see each item. For all other roles it is locked in code.
        Superusers see customer data only after an access request.
      </p>
    </aside>
  )
}
