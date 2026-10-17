import StatusBadge from './StatusBadge'

const stateBox = 'rounded-xl border border-stone-200 bg-white p-9 text-center text-stone-600'
const actionBtn = 'rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40'
const btnBase = 'rounded-md px-2.5 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40'
const btnEdit = `${btnBase} border border-brand text-brand hover:bg-brand-soft`
const btnStatus = `${btnBase} bg-brand text-white hover:bg-brand-light`

export default function TableData({ items, loading, error, onRetry, onEdit, onStatus }) {
  if (loading) {
    return <div className={stateBox}>Fetching data…</div>
  }

  if (error) {
    return (
      <div className={`${stateBox} border-red-200 bg-red-50`}>
        <h3 className="mb-1 font-semibold text-stone-900">Failed to load data</h3>
        <p className="mb-3">{error.message}</p>
        <button onClick={onRetry} className={actionBtn}>Retry</button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={stateBox}>
        <h3 className="mb-1 font-semibold text-stone-900">No data found</h3>
        <p>Please try using another keyword or status.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white">
      <table className="w-full table-fixed text-sm">
        <thead className="bg-brand text-sm font-semibold text-white text-center">
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
          {items.map((c) => (
            <tr key={c.id} className="hover:bg-brand-soft/20 text-center">
              <td className="px-4 py-3 tabular-nums">{c.serialNumber}</td>
              <td className="px-4 py-3">{c.gasType}</td>
              <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
              <td className="truncate px-4 py-3" title={c.customerName ?? ''}>
                {c.customerName ?? '-'}
              </td>
              <td className="px-4 py-3 tabular-nums">{new Date(c.lastUpdated).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <div className="flex justify-center gap-1.5">
                  <button className={btnEdit} onClick={() => onEdit(c)}>Edit</button>
                  <button
                    className={btnStatus}
                    disabled={c.status === 'Retired'}
                    title={c.status === 'Retired' ? "Retired cylinders can't change status" : ''}
                    onClick={() => onStatus(c)}
                  >
                    Status
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div >
  )
}