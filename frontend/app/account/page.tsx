import Button from '../../src/components/ui/Button'
import TextField from '../../src/components/ui/TextField'
import Icon from '../../src/components/ui/Icon'
import styles from './page.module.css'

export const metadata = {
  title: 'My account | DevBoys',
}

export default function AccountPage() {
  return (
    <div className={styles.content}>
      <section className={styles.profile} aria-labelledby="profile-name">
        <div className={styles.avatar}>
          <span aria-hidden="true">MJ</span>
          <button type="button" className={styles.addPhoto} aria-label="Add profile photo" aria-disabled="true">
            <Icon name="plus" />
          </button>
        </div>
        <div>
          <h2 id="profile-name">(NAAM)</h2>
          <p>email@devboyz.nl</p>
          <span className={styles.role}>Tier 1 analyst</span>
        </div>
      </section>
      <section className={styles.card} aria-labelledby="general-title">
        <h2 id="general-title">General information</h2>
        <div className={styles.cardBody}>
          <div className={styles.fields}>
            <TextField id="account-name" name="name" label="Name" autoComplete="name" defaultValue="(NAAM)" readOnly className={styles.readOnly} />
            <TextField id="account-email" label="Email address" type="email" defaultValue="email@devboyz.nl" readOnly className={styles.readOnly} />
            <TextField id="account-role" label="Role" defaultValue="Tier 1 analyst" readOnly className={styles.readOnly} aria-describedby="account-help" />
            <TextField id="account-access" label="Customer access" defaultValue="14 customers" readOnly className={styles.readOnly} aria-describedby="account-help" />
          </div>
          <p id="account-help" className={styles.help}>
            Your role and customer access are managed by a superuser. Your photo and name are visible to colleagues in the case chat.
          </p>
          <div className={styles.actions}>
            <Button variant="primary" type="button" aria-disabled="true">Save</Button>
            <Button variant="secondary" type="button" aria-disabled="true">Cancel</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
