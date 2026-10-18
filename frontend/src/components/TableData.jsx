import StatusBadge from './StatusBadge'
import { IDLE_DAYS } from '../utils/constant'
import { daysSince, formatTime } from '../utils/date-format'

const stateBox = 'rounded-xl border border-mauve-200 bg-white p-9 text-center text-mauve-600'
const actionBtn = 'rounded-md border border-brand-soft bg-white px-2.5 py-1 text-xs hover:bg-mauve-50 disabled:cursor-not-allowed disabled:opacity-40'
const btnBase = 'rounded-md px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40'
const btnEdit = `${btnBase} border border-brand text-brand hover:bg-brand-soft`
const btnStatus = `${btnBase} bg-brand text-white hover:bg-brand-light`

export default function TableData({ data, loading, error, onRetry, onEdit, onStatus }) {
  const items = data?.items ?? []

  if (error) {
    return (
      <div className={`${stateBox} border-red-200 bg-red-50`}>
        <h3 className="mb-1 font-semibold text-mauve-900">Failed to load data</h3>
        <p className="mb-3">{error.message}</p>
        <button onClick={onRetry} className={actionBtn}>Retry</button>
      </div>
    )
  }

  if (loading && !data) {
    return <div className={stateBox}>Fetching data...</div>
  }

  if (items.length === 0 && !loading) {
    return (
      <div className={stateBox}>
        <h3 className="mb-1 font-semibold text-mauve-900">No data found</h3>
        <p>Please try using another keyword or status.</p>
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-mauve-200 bg-white ${loading ? 'opacity-60' : ''}`}>
      <table className="w-full min-w-190 table-fixed text-xs text-center">
        <colgroup>
          <col className="w-36" />
          <col className="w-36" />
          <col className="w-40" />
          <col />
          <col className="w-32" />
          <col className="w-40" />
        </colgroup>
        <thead className="border-b border-mauve-200 bg-mauve-50 text-xs font-semibold tracking-wide text-mauve-500 uppercase">
          <tr>
            <th className="px-4 py-3">Serial no.</th>
            <th className="px-4 py-3">Gas type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Customer name</th>
            <th className="px-4 py-3">Updated at</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => {
            const retired = c.status === 'Retired'
            const idle = !retired && daysSince(c.lastUpdated) >= IDLE_DAYS
            return (
              <tr key={c.id} className="border-b border-mauve-100 last:border-0 hover:bg-brand-soft/20">
                <td className="px-4 py-3 tabular-nums whitespace-nowrap">{c.serialNumber}</td>
                <td className="px-4 py-3 whitespace-nowrap">{c.gasType}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="truncate px-4 py-3" title={c.customerName ?? ''}>
                  {c.customerName ?? '-'}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {new Date(c.lastUpdated).toLocaleDateString()}
                  <div className="text-mauve-400">{formatTime(c.lastUpdated)}</div>
                   {idle && <div className="text-xs text-amber-700">idle {daysSince(c.lastUpdated)} days</div>}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-center gap-1.5">
                    <button className={btnEdit} onClick={() => onEdit(c)}>Edit</button>
                    <button
                      className={btnStatus}
                      disabled={retired}
                      title={retired ? "Retired cylinders can't change status" : ''}
                      onClick={() => onStatus(c)}
                    >
                      Status
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
