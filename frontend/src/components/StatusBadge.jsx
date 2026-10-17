import { STATUS_STYLES } from '../utils/constant'

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-lg px-2.5 py-0.5 text-sm font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  )
}