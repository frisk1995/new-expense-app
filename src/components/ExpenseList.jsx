import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

function ExpenseList({ projectId }) {
  const [expenses, setExpenses] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formData, setFormData] = useState({
    payerId: '',
    beneficiaryIds: [],
    amount: '',
    memo: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchData()
  }, [projectId])

  const fetchData = async () => {
    try {
      // ユーザー一覧を取得
      const usersSnapshot = await getDocs(collection(db, 'projects', projectId, 'users'))
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(usersList)

      // 経費記録を取得
      const expensesQuery = query(
        collection(db, 'projects', projectId, 'expenses'),
        orderBy('date', 'desc')
      )
      const expensesSnapshot = await getDocs(expensesQuery)
      const expensesList = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setExpenses(expensesList)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = () => {
    setEditingExpense(null)
    setFormData({
      payerId: '',
      beneficiaryIds: [],
      amount: '',
      memo: '',
      date: new Date().toISOString().split('T')[0]
    })
    setShowModal(true)
  }

  const handleEditExpense = (expense) => {
    setEditingExpense(expense)
    setFormData({
      payerId: expense.payerId,
      beneficiaryIds: expense.beneficiaries.map(b => b.userId),
      amount: expense.amount.toString(),
      memo: expense.memo || '',
      date: expense.date?.toDate ? expense.date.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.payerId || formData.beneficiaryIds.length === 0 || !formData.amount) {
      alert('必須項目を入力してください')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('有効な金額を入力してください')
      return
    }

    try {
      const payer = users.find(u => u.id === formData.payerId)
      const beneficiaries = formData.beneficiaryIds.map(id => {
        const user = users.find(u => u.id === id)
        return {
          userId: user.id,
          userName: user.name
        }
      })

      const expenseData = {
        payerId: formData.payerId,
        payerName: payer.name,
        beneficiaries,
        amount,
        memo: formData.memo,
        date: Timestamp.fromDate(new Date(formData.date)),
        updatedAt: serverTimestamp()
      }

      if (editingExpense) {
        // 更新
        await updateDoc(doc(db, 'projects', projectId, 'expenses', editingExpense.id), expenseData)
      } else {
        // 新規作成
        await addDoc(collection(db, 'projects', projectId, 'expenses'), {
          ...expenseData,
          createdAt: serverTimestamp()
        })
      }

      setShowModal(false)
      fetchData()
    } catch (error) {
      console.error('Error saving expense:', error)
      alert('保存に失敗しました')
    }
  }

  const handleDelete = async (expenseId) => {
    if (!window.confirm('この記録を削除しますか？')) return

    try {
      await deleteDoc(doc(db, 'projects', projectId, 'expenses', expenseId))
      fetchData()
    } catch (error) {
      console.error('Error deleting expense:', error)
      alert('削除に失敗しました')
    }
  }

  const toggleBeneficiary = (userId) => {
    if (formData.beneficiaryIds.includes(userId)) {
      setFormData({
        ...formData,
        beneficiaryIds: formData.beneficiaryIds.filter(id => id !== userId)
      })
    } else {
      setFormData({
        ...formData,
        beneficiaryIds: [...formData.beneficiaryIds, userId]
      })
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">建て替え記録</h2>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-600">まだ記録がありません</p>
          <p className="text-gray-400 text-sm mt-1">右下の＋ボタンから追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div 
              key={expense.id} 
              className="bg-white border border-gray-200 rounded-lg p-5"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1" onClick={() => handleEditExpense(expense)} style={{cursor: 'pointer'}}>
                  <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                  <p className="font-semibold text-lg text-gray-800 mt-2">
                    {expense.payerName} <span className="text-gray-400 mx-2">→</span> {expense.beneficiaries.map(b => b.userName).join(', ')}
                  </p>
                  {expense.memo && (
                    <p className="text-sm text-gray-600 mt-2">{expense.memo}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-2xl font-bold text-primary">¥{expense.amount.toLocaleString()}</p>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="btn btn-ghost btn-sm text-red-500"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* フローティングアクションボタン */}
      <button 
        onClick={handleAddExpense}
        className="fixed bottom-24 right-6 btn btn-primary btn-circle w-14 h-14 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* 経費追加・編集モーダル */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-white max-w-md">
            <h3 className="font-bold text-xl mb-6 text-gray-900">
              {editingExpense ? '経費を編集' : '経費を追加'}
            </h3>
            
            <div className="space-y-4">
              {/* 支払者 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">支払者</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.payerId}
                  onChange={(e) => setFormData({...formData, payerId: e.target.value})}
                >
                  <option value="">選択してください</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              {/* 受益者 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">受益者（複数選択可）</span>
                </label>
                <div className="space-y-2">
                  {users.map(user => (
                    <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={formData.beneficiaryIds.includes(user.id)}
                        onChange={() => toggleBeneficiary(user.id)}
                      />
                      <span>{user.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 金額 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">金額</span>
                </label>
                <input
                  type="number"
                  placeholder="金額を入力"
                  className="input input-bordered"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>

              {/* 日付 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">日付</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              {/* メモ */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">メモ（任意）</span>
                </label>
                <textarea
                  placeholder="メモを入力"
                  className="textarea textarea-bordered"
                  rows="3"
                  value={formData.memo}
                  onChange={(e) => setFormData({...formData, memo: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-action gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline flex-1"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary flex-1"
              >
                {editingExpense ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseList
