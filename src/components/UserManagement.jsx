import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query } from 'firebase/firestore'
import { db } from '../firebase/config'

function UserManagement({ projectId }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editUserName, setEditUserName] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [projectId])

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'projects', projectId, 'users'))
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(usersList)
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUserName.trim()) return

    try {
      await addDoc(collection(db, 'projects', projectId, 'users'), {
        name: newUserName,
        createdAt: serverTimestamp()
      })
      setShowAddModal(false)
      setNewUserName('')
      fetchUsers()
    } catch (error) {
      console.error('Error adding user:', error)
      alert('ユーザーの追加に失敗しました')
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setEditUserName(user.name)
    setShowEditModal(true)
  }

  const handleUpdateUser = async () => {
    if (!editUserName.trim() || !editingUser) return

    try {
      await updateDoc(doc(db, 'projects', projectId, 'users', editingUser.id), {
        name: editUserName
      })
      setShowEditModal(false)
      setEditingUser(null)
      setEditUserName('')
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      alert('ユーザーの更新に失敗しました')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('このユーザーを削除しますか？\n※建て替え記録がある場合は削除できません')) return

    try {
      // 経費記録があるかチェック
      const expensesSnapshot = await getDocs(
        query(collection(db, 'projects', projectId, 'expenses'))
      )
      
      const hasExpenses = expensesSnapshot.docs.some(doc => {
        const expense = doc.data()
        return expense.payerId === userId || 
               expense.beneficiaries.some(b => b.userId === userId)
      })

      if (hasExpenses) {
        alert('このユーザーに紐づく建て替え記録が存在するため、削除できません')
        return
      }

      await deleteDoc(doc(db, 'projects', projectId, 'users', userId))
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('ユーザーの削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
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
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="btn btn-ghost btn-circle text-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
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

      {/* ユーザー編集モーダル */}
      {showEditModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md bg-white">
            <h3 className="font-bold text-xl text-gray-800 mb-6">ユーザー名を編集</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base font-medium">ユーザー名</span>
              </label>
              <input
                type="text"
                placeholder="名前を入力"
                className="input input-bordered input-lg"
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
              />
            </div>
            <div className="modal-action gap-3 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-outline btn-lg flex-1"
              >
                キャンセル
              </button>
              <button
                onClick={handleUpdateUser}
                className="btn btn-primary btn-lg flex-1 text-white"
                disabled={!editUserName.trim()}
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
