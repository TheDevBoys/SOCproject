import Card from '../ui/Card'
import styles from './SLAComplianceTable.module.css'

const customers = [
  {
    name: 'Care Beta',
    cases: 96,
    withinSLA: 90,
    compliance: 93.8,
    resolution: '2 h 41 min'
  },
  {
    name: 'Insurer Theta',
    cases: 63,
    withinSLA: 62,
    compliance: 98.4,
    resolution: '2 h 18 min'
  },
  {
    name: 'Bank Alpha',
    cases: 128,
    withinSLA: 127,
    compliance: 99.2,
    resolution: '1 h 47 min'
  }
]

export default function SLAComplianceTable() {
  return (
    <Card
      title="SLA compliance per customer"
      titleId="sla-compliance-table"
      subtitle="lowest compliance first"
      flush
    >
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Cases</th>
              <th>Within SLA</th>
              <th>Compliance</th>
              <th>Avg. resolution time</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr key={customer.name}>
                <td className={styles.customerName}>
                  {customer.name}
                </td>

                <td>{customer.cases}</td>

                <td>{customer.withinSLA}</td>

                <td>
                  <div className={styles.compliance}>
                    <div className={styles.progress}>
                      <div
                        className={[
                          styles.progressFill,
                          customer.compliance < 95 && styles.warning
                        ].filter(Boolean).join(' ')}
                        style={{ width: `${customer.compliance}%` }}
                      />
                    </div>

                    <strong>{customer.compliance}%</strong>
                  </div>
                </td>

                <td>{customer.resolution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.footer}>
        Only customers you have access to. An account manager never sees
        figures of other customers.
      </p>
    </Card>
  )
}