import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCylinders } from '../utils/api'
import { STATUSES } from '../utils/constant'
import TableData from '../components/TableData'
import Pagination from '../components/Pagination'
import FormModal from '../components/FormModal'
import StatusChangeModal from '../components/StatusChangeModal'
import Select from '../components/Select'

export default function Database() {
  const [searchParams] = useSearchParams()

  // filters
  const [keyword, setKeyword] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') ?? '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // data
  const [result, setResult] = useState({ items: [], totalCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setResult(await getCylinders({ search, status, page, pageSize }))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [search, status, page, pageSize])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(keyword)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [keyword])

  function handleStatusChange(value) {
    setStatus(value)
    setPage(1)
  }

  function handlePageSizeChange(size) {
    setPageSize(size)
    setPage(1)
  }

  const closeModal = () => setModal(null)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold">Database Cylinders</h1>
      <p className="mb-5 mt-1 text-mauve-600">Manage the data and update the status here</p>

      <div className="mb-4 flex gap-2.5">
        <input
          className="flex-1 rounded-lg border border-brand-soft bg-white px-3 py-2 outline-none focus:border-brand"
          placeholder="Search serial number or customer..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Select
          className="w-44"
          value={status}
          onChange={handleStatusChange}
          options={[{ value: '', label: 'All statuses' }, ...STATUSES.map((s) => ({ value: s, label: s }))]}
        />
        <button
          onClick={() => setModal({ type: 'form', cylinder: null })}
          className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-soft hover:text-brand"
        >
          + Add cylinder
        </button>
      </div>

      <TableData
        items={result.items}
        loading={loading}
        error={error}
        onRetry={load}
        onEdit={(c) => setModal({ type: 'form', cylinder: c })}
        onStatus={(c) => setModal({ type: 'status', cylinder: c })}
      />

      {!loading && !error && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={result.totalCount}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {modal?.type === 'form' && (
        <FormModal cylinder={modal.cylinder} onClose={closeModal} onSaved={load} />
      )}
      {modal?.type === 'status' && (
        <StatusChangeModal cylinder={modal.cylinder} onClose={closeModal} onSaved={load} />
      )}
    </div>
  )
}