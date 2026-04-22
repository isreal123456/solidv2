export default function LoadingSpinner() {
  return (
    <div className="flex min-h-60 items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
    </div>
  )
}
