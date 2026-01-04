import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProjectSelector from './pages/ProjectSelector'
import UserSelector from './pages/UserSelector'
import MainApp from './pages/MainApp'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-base-200">
        <Routes>
          <Route path="/" element={<ProjectSelector />} />
          <Route path="/select-user/:projectId" element={<UserSelector />} />
          <Route path="/app/:projectId" element={<MainApp />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
