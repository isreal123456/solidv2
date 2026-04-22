import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import StaffCard from '../../components/admin/StaffCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import * as api from '../../services/api'

const initialForm = {
  name: '',
  pin: '',
  role: 'staff',
}

export default function StaffManagement() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [pinStaff, setPinStaff] = useState(null)
  const [newPin, setNewPin] = useState('')

  const loadStaff = async () => {
    setLoading(true)
    try {
      const data = await api.getStaff()
      setStaff(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load staff'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadStaff()
  }, [])

  const handleAddStaff = async (event) => {
    event.preventDefault()
    try {
      await api.addStaff(form)
      toast.success('Staff added')
      setShowAddModal(false)
      setForm(initialForm)
      await loadStaff()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to add staff'
      toast.error(message)
    }
  }

  const handleRemove = async (member) => {
    const confirmed = window.confirm(`Remove ${member.name} from staff list?`)
    if (!confirmed) return

    try {
      await api.removeStaff(member.id)
      toast.success(`${member.name} removed`)
      await loadStaff()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to remove staff'
      toast.error(message)
    }
  }

  const handleResetPin = async (event) => {
    event.preventDefault()
    if (!pinStaff) return

    try {
      await api.resetPin(pinStaff.id, newPin)
      toast.success(`PIN reset for ${pinStaff.name}`)
      setShowPinModal(false)
      setPinStaff(null)
      setNewPin('')
      await loadStaff()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to reset PIN'
      toast.error(message)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Staff management</h2>
          <p className="mt-1 text-sm text-slate-500">Manage staff accounts and PIN access.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Add staff
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {staff.map((member) => (
          <StaffCard
            key={member.id}
            staff={member}
            onRemove={handleRemove}
            onResetPin={(staffMember) => {
              setPinStaff(staffMember)
              setShowPinModal(true)
            }}
          />
        ))}
      </div>

      {showAddModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <form onSubmit={handleAddStaff} className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Add staff member</h3>
            <div className="mt-4 grid gap-3">
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Full name"
                required
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={form.pin}
                type="password"
                onChange={(event) => setForm((prev) => ({ ...prev, pin: event.target.value }))}
                placeholder="4-digit PIN"
                required
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
                Cancel
              </button>
              <button type="submit" className="rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white">
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {showPinModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <form onSubmit={handleResetPin} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Reset PIN for {pinStaff?.name}</h3>
            <input
              value={newPin}
              type="password"
              onChange={(event) => setNewPin(event.target.value)}
              placeholder="New 4-digit PIN"
              required
              className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false)
                  setPinStaff(null)
                }}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button type="submit" className="rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white">
                Reset PIN
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
