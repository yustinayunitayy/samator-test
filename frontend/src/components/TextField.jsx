export default function Field({ label, error, hint, children }) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-xs font-medium text-mauve-800">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-mauve-500">{hint}</p>}
    </div>
  )
}