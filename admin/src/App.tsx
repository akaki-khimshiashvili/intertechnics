import { Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { MachinesList } from './pages/machines/MachinesList'
import { MachineCreatePage } from './pages/machines/MachineCreatePage'
import { MachineEditPage } from './pages/machines/MachineEditPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './components/AdminLayout'
import { ToastContainer } from './components/Toast'

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/machines"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <MachinesList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/machines/new"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <MachineCreatePage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/machines/:id/edit"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <MachineEditPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer />
    </>
  )
}

export default App
