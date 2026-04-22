import { Toaster } from 'react-hot-toast'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            color: '#0f172a',
          },
        }}
      />
    </>
  )
}

export default App
