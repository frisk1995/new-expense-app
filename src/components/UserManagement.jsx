import { useState } from 'react'

function UserManagement({ projectId }) {
  const [users, setUsers] = useState([
    { id: 'user1', name: '田中' },
    { id: 'user2', name: '佐藤' },
  ])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')

  const handleAddUser = () => {
    // TODO: Firebaseに追加
    const newUser = {
      id: 'user_' + Date.now(),
      name: newUserName
    }
    setUsers([...users, newUser])
    setShowAddModal(false)
    setNewUserName('')
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm('このユーザーを削除しますか？')) {
      // TODO: Firebaseから削除（建て替え記録がある場合はエラー）
      setUsers(users.filter(u => u.id !== userId))
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">ユーザー管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary btn-lg"
        >
          追加
        </button>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="font-semibold text-lg text-gray-800">{user.name}</span>
              </div>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="btn btn-ghost btn-circle text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ユーザー追加モーダル */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md bg-white">
            <h3 className="font-bold text-xl text-gray-800 mb-6">ユーザーを追加</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base font-medium">ユーザー名</span>
              </label>
              <input
                type="text"
                placeholder="名前を入力"
                className="input input-bordered input-lg"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="modal-action gap-3 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-outline btn-lg flex-1"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddUser}
                className="btn btn-primary btn-lg flex-1 text-white"
                disabled={!newUserName.trim()}
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
