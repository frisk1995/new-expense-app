import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

function ProjectSelector() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectId, setProjectId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // ローカルストレージから参加済みプロジェクトを読み込み
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]')
    setProjects(savedProjects)
  }, [])

  const handleCreateProject = async () => {
    if (!projectName.trim()) return
    
    setLoading(true)
    try {
      // Firebaseでプロジェクトを作成
      const projectRef = await addDoc(collection(db, 'projects'), {
        name: projectName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      console.log('Project created with ID:', projectRef.id)
      setShowCreateModal(false)
      setProjectName('')
      navigate(`/select-user/${projectRef.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert('プロジェクトの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinProject = () => {
    navigate(`/select-user/${projectId}`)
  }

  const handleSelectProject = (project) => {
    localStorage.setItem('currentProjectId', project.projectId)
    localStorage.setItem('currentUserId', project.userId)
    navigate(`/app/${project.projectId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            経費建て替え管理
          </h1>
          <p className="text-gray-600">グループでの経費を簡単に管理</p>
        </div>

        {/* 参加中のプロジェクト一覧 */}
        {projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">参加中のプロジェクト</h2>
            <div className="space-y-3">
              {projects.map((project, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectProject(project)}
                  className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow active:scale-98"
                >
                  <h3 className="font-semibold text-lg text-gray-900">{project.projectName}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    ユーザー: {project.userName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="space-y-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary w-full h-14 text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            新しいプロジェクトを作成
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn btn-outline w-full h-14 text-base border-gray-300 hover:bg-gray-50"
          >
            プロジェクトに参加
          </button>
        </div>

        {/* プロジェクト作成モーダル */}
        {showCreateModal && (
          <div className="modal modal-open">
            <div className="modal-box bg-white max-w-md">
              <h3 className="font-bold text-xl mb-6 text-gray-900">新しいプロジェクト</h3>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm font-medium text-gray-700">プロジェクト名</span>
                </label>
                <input
                  type="text"
                  placeholder="例: 社員旅行2024"
                  className="input input-bordered h-12 bg-white"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="modal-action gap-3 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline flex-1 h-12"
                  disabled={loading}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateProject}
                  className="btn btn-primary flex-1 h-12"
                  disabled={!projectName.trim() || loading}
                >
                  {loading ? '作成中...' : '作成'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* プロジェクト参加モーダル */}
        {showJoinModal && (
          <div className="modal modal-open">
            <div className="modal-box bg-white max-w-md">
              <h3 className="font-bold text-xl mb-6 text-gray-900">プロジェクトに参加</h3>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm font-medium text-gray-700">プロジェクトID</span>
                </label>
                <input
                  type="text"
                  placeholder="プロジェクトIDを入力"
                  className="input input-bordered h-12 bg-white"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                />
              </div>
              <div className="modal-action gap-3 mt-8">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="btn btn-outline flex-1 h-12"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleJoinProject}
                  className="btn btn-primary flex-1 h-12"
                  disabled={!projectId.trim()}
                >
                  参加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectSelector
