import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function UserSelector() {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [users, setUsers] = useState([])
  const [projectName, setProjectName] = useState('')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')

  useEffect(() => {
    // TODO: Firebaseからプロジェクト情報とユーザー一覧を取得
    setProjectName('テストプロジェクト')
    setUsers([
      { id: 'user1', name: '田中' },
      { id: 'user2', name: '佐藤' },
    ])
  }, [projectId])

  const handleSelectUser = (user) => {
    // ローカルストレージに保存
    const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    const existingIndex = projects.findIndex(p => p.projectId === projectId)
    
    const projectData = {
      projectId,
      projectName,
      userId: user.id,
      userName: user.name
    }

    if (existingIndex >= 0) {
      projects[existingIndex] = projectData
    } else {
      projects.push(projectData)
    }

    localStorage.setItem('projects', JSON.stringify(projects))
    localStorage.setItem('currentProjectId', projectId)
    localStorage.setItem('currentUserId', user.id)

    navigate(`/app/${projectId}`)
  }

  const handleAddUser = async () => {
    // TODO: Firebaseに新しいユーザーを追加
    const newUser = {
      id: 'user_' + Date.now(),
      name: newUserName
    }
    setUsers([...users, newUser])
    setShowAddUserModal(false)
    setNewUserName('')
    handleSelectUser(newUser)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost gap-2 mb-6 pl-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
          <p className="text-sm text-gray-500 mt-2">
            プロジェクトID: {projectId}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ユーザーを選択</h2>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="btn btn-primary w-full h-14 text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          新しいユーザーとして参加
        </button>

        {/* ユーザー追加モーダル */}
        {showAddUserModal && (
          <div className="modal modal-open">
            <div className="modal-box bg-white max-w-md">
              <h3 className="font-bold text-xl mb-6 text-gray-900">新しいユーザー</h3>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm font-medium text-gray-700">ユーザー名</span>
                </label>
                <input
                  type="text"
                  placeholder="名前を入力"
                  className="input input-bordered h-12 bg-white"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
              <div className="modal-action gap-3 mt-8">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="btn btn-outline flex-1 h-12"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddUser}
                  className="btn btn-primary flex-1 h-12"
                  disabled={!newUserName.trim()}
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserSelector
