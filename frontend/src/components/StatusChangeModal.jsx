import { useState } from 'react'
import Modal from './Modal'
import Field from './TextField'
import StatusBadge from './StatusBadge'
import Select from './Select'
import { ALLOWED_TRANSITIONS, CUSTOMER_NAME_MAX, STATUS_LABELS } from '../utils/constant'
import { changeStatus } from '../utils/api'
import { confirmAction, showError, showToast } from '../utils/alerts'

const inputCls = 'w-full rounded-lg border border-mauve-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15'

export default function StatusChangeModal({ cylinder, onClose, onSaved }) {
  const options = ALLOWED_TRANSITIONS[cylinder.status]
  const [newStatus, setNewStatus] = useState(options[0] ?? '')
  const [customerName, setCustomerName] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const needsCustomer = newStatus === 'Delivered'

  function validate() {
    const next = {}
    const name = customerName.trim()
    if (needsCustomer) {
      if (!name) next.customerName = 'Customer name is required when the status is Delivered.'
      else if (name.length > CUSTOMER_NAME_MAX) next.customerName = `Customer name must not exceed ${CUSTOMER_NAME_MAX} characters.`
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const detail = needsCustomer ? `<br><small>Customer: ${customerName.trim()}</small>` : ''
    const ok = await confirmAction(
      `Change <b>${cylinder.serialNumber}</b> from ${STATUS_LABELS[cylinder.status]} to <b>${STATUS_LABELS[newStatus]}</b>?${detail}`,
      'Yes, update',
    )
    if (!ok) return

    setSaving(true)
    try {
      await changeStatus(cylinder.id, {
        status: newStatus,
        customerName: needsCustomer ? customerName.trim() : null,
      })
      showToast(`Status changed to ${STATUS_LABELS[newStatus]}`)
      onSaved()
      onClose()
    } catch (err) {
      showError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Change status - ${cylinder.serialNumber}`} onClose={onClose}>
      <p className="mb-4 text-sm text-mauve-600">
        Current status: <StatusBadge status={cylinder.status} />
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <Field label="New status *" hint={`Only transitions allowed from ${STATUS_LABELS[cylinder.status]} are listed.`}>
          <Select
            className="w-full"
            value={newStatus}
            onChange={setNewStatus}
            options={options.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
          />
        </Field>

        {needsCustomer && (
          <Field
            label={`Customer name * (${customerName.trim().length}/${CUSTOMER_NAME_MAX})`}
            error={errors.customerName}
          >
            <input
              className={inputCls}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Receiving company"
              autoFocus
            />
          </Field>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-mauve-300 bg-white px-3.5 py-2 text-sm font-medium text-mauve-800 hover:bg-mauve-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50">
            {saving ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </Modal>
  )
}