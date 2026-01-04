import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'

function BalanceView({ projectId }) {
  const [balances, setBalances] = useState([])
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)

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

      // 残高を計算
      const balanceMap = {}
      users.forEach(user => {
        balanceMap[user.id] = {
          userId: user.id,
          userName: user.name,
          balance: 0
        }
      })

      expenses.forEach(expense => {
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">清算方法</h2>
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
