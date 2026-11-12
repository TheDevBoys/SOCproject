import styles from './CaseTable.module.css'

export default function CaseTable() {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Title</th>
          <th>Severity</th>
          <th>Customer</th>
          <th>Status </th>
          <th>Owner </th>
          <th>SLA remaining </th>
          <th>Alerts </th>
          <th>Last Update </th>
          <th> </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Case 1 </td>
          <td>High </td>
          <td>Customer 1 </td>
          <td>Open </td>
          <td>John Doe</td>
          <td>2 days </td>
          <td>3 </td>
          <td>2023-10-01 </td>
          <td>
            <button>Join</button>
          </td>
        </tr>
        <tr>
          <td>Case 2 </td>
          <td>Medium </td>
          <td>Customer 2 </td>
          <td>In Progress </td>
          <td>Jane Smith</td>
          <td>1 day </td>
          <td>1 </td>
          <td>2023-10-02 </td>
          <td>
            <button>Join</button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}