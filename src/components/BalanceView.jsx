import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

function BalanceView({ projectId }) {
  const [balances, setBalances] = useState([])
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchAndCalculate()
  }, [projectId])

  const fetchAndCalculate = async () => {
    try {
      // ユーザー一覧を取得
      const usersSnapshot = await getDocs(collection(db, 'projects', projectId, 'users'))
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // 経費記録を取得
      const expensesQuery = query(
        collection(db, 'projects', projectId, 'expenses'),
        orderBy('date', 'desc')
      )
      const expensesSnapshot = await getDocs(expensesQuery)
      const expenses = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // 残高を計算（未精算のみ）
      const activeExpenses = expenses.filter(exp => !exp.settled)

      const balanceMap = {}
      users.forEach(user => {
        balanceMap[user.id] = {
          userId: user.id,
          userName: user.name,
          balance: 0
        }
      })

      activeExpenses.forEach(expense => {
        // 支払者の残高を増やす
        if (balanceMap[expense.payerId]) {
          balanceMap[expense.payerId].balance += expense.amount
        }

        // 受益者の残高を減らす
        const beneficiaryCount = expense.beneficiaries.length
        const amountPerPerson = expense.amount / beneficiaryCount

        expense.beneficiaries.forEach(beneficiary => {
          if (balanceMap[beneficiary.userId]) {
            balanceMap[beneficiary.userId].balance -= amountPerPerson
          }
        })
      })

      const balancesList = Object.values(balanceMap).sort((a, b) => b.balance - a.balance)
      setBalances(balancesList)

      // 清算方法を計算
      const settlementsList = calculateSettlements(balancesList)
      setSettlements(settlementsList)
    } catch (error) {
      console.error('Error fetching and calculating:', error)
      alert('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const calculateSettlements = (balances) => {
    const creditors = balances.filter(b => b.balance > 0.01).map(b => ({...b}))
    const debtors = balances.filter(b => b.balance < -0.01).map(b => ({...b}))
    
    const transactions = []
    let i = 0, j = 0
    
    while (i < creditors.length && j < debtors.length) {
      const amount = Math.min(creditors[i].balance, -debtors[j].balance)
      
      if (amount > 0.01) {
        transactions.push({
          from: debtors[j].userName,
          to: creditors[i].userName,
          amount: Math.round(amount)
        })
      }
      
      creditors[i].balance -= amount
      debtors[j].balance += amount
      
      if (creditors[i].balance < 0.01) i++
      if (debtors[j].balance > -0.01) j++
    }
    
    return transactions
  }

  const handleBulkSettlement = async () => {
    if (settlements.length === 0) return
    
    if (!window.confirm(`${settlements.length}件の清算記録を追加します。よろしいですか？`)) {
      return
    }

    setProcessing(true)
    try {
      // ユーザー情報を取得
      const usersSnapshot = await getDocs(collection(db, 'projects', projectId, 'users'))
      const usersMap = {}
      usersSnapshot.docs.forEach(doc => {
        usersMap[doc.data().name] = {
          id: doc.id,
          name: doc.data().name
        }
      })

      // 各清算取引を経費記録として追加
      const currentDate = new Date()
      for (const settlement of settlements) {
        const payer = usersMap[settlement.from]
        const beneficiary = usersMap[settlement.to]
        
        if (payer && beneficiary) {
          await addDoc(collection(db, 'projects', projectId, 'expenses'), {
            payerId: payer.id,
            payerName: payer.name,
            beneficiaries: [{
              userId: beneficiary.id,
              userName: beneficiary.name
            }],
            amount: settlement.amount,
            memo: '一括清算',
            date: Timestamp.fromDate(currentDate),
            settled: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        }
      }

      alert('清算が完了しました')
      fetchAndCalculate()
    } catch (error) {
      console.error('Error processing settlement:', error)
      alert('清算処理に失敗しました')
    } finally {
      setProcessing(false)
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">収支状況</h2>
        <div className="space-y-3">
          {balances.map((balance, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg text-gray-800">{balance.userName}</span>
                <span className={`text-2xl font-bold ${balance.balance > 0.01 ? 'text-green-600' : balance.balance < -0.01 ? 'text-red-600' : 'text-gray-600'}`}>
                  {balance.balance > 0.01 ? '+' : ''}¥{Math.round(balance.balance).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">清算方法</h2>
          {settlements.length > 0 && (
            <button
              onClick={handleBulkSettlement}
              disabled={processing}
              className="btn btn-primary"
            >
              {processing ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  処理中...
                </>
              ) : (
                '一括清算'
              )}
            </button>
          )}
        </div>
        {settlements.length === 0 ? (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600">清算は完了しています</p>
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.map((settlement, index) => (
              <div key={index} className="bg-primary text-white rounded-lg p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-center flex-1">
                    <p className="font-bold text-lg">{settlement.from}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <div className="text-center flex-1">
                    <p className="font-bold text-lg">{settlement.to}</p>
                  </div>
                </div>
                <p className="text-center text-3xl font-bold mt-4">¥{settlement.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BalanceView
