import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ExpenseList from '../components/ExpenseList'
import BalanceView from '../components/BalanceView'
import UserManagement from '../components/UserManagement'

function MainApp() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('expenses')
  const [projectName, setProjectName] = useState('')
  const [currentUserName, setCurrentUserName] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    // プロジェクト情報を取得
    const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    const currentProject = projects.find(p => p.projectId === projectId)
    
    if (currentProject) {
      setProjectName(currentProject.projectName)
      setCurrentUserName(currentProject.userName)
    } else {
      // プロジェクト情報がない場合は選択画面に戻る
      navigate('/')
    }
  }, [projectId, navigate])

  const handleLogout = () => {
    navigate('/')
  }

  const handleSwitchProject = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">{projectName}</h1>
              <p className="text-sm text-gray-500">{currentUserName}</p>
            </div>
            <div className="flex-none">
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </label>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-white rounded-lg w-52 border border-gray-100">
                  <li><a onClick={handleSwitchProject} className="py-2 hover:bg-gray-50">プロジェクトを切り替え</a></li>
                  <li><a onClick={handleLogout} className="py-2 hover:bg-gray-50">ログアウト</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {activeTab === 'expenses' && <ExpenseList projectId={projectId} />}
        {activeTab === 'balance' && <BalanceView projectId={projectId} />}
        {activeTab === 'users' && <UserManagement projectId={projectId} />}
      </div>

      {/* フローティングアクションボタン */}
      {activeTab === 'expenses' && (
        <button className="fixed bottom-24 right-6 btn btn-primary btn-circle w-14 h-14 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* ボトムナビゲーション */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 h-16">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex flex-col items-center justify-center gap-1 ${
                activeTab === 'expenses' ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs font-medium">建て替え</span>
            </button>

            <button
              onClick={() => setActiveTab('balance')}
              className={`flex flex-col items-center justify-center gap-1 ${
                activeTab === 'balance' ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium">清算</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex flex-col items-center justify-center gap-1 ${
                activeTab === 'users' ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-xs font-medium">ユーザー</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainApp
