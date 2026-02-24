import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { Providers } from '@/app/providers'
import { ToastContainer } from '@/components/ui/toast'

function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <ToastContainer />
    </Providers>
  )
}

export default App
