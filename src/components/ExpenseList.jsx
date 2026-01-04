function ExpenseList({ projectId }) {
  // TODO: Firestoreからデータを取得
  const expenses = [
    {
      id: '1',
      date: '2026-01-03',
      payerName: '田中',
      beneficiaries: [{ userName: '佐藤' }],
      amount: 3000,
      memo: 'ランチ代'
    }
  ]

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
            <div key={expense.id} className="bg-white border border-gray-200 rounded-lg p-5 cursor-pointer">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{expense.date}</p>
                  <p className="font-semibold text-lg text-gray-800 mt-2">
                    {expense.payerName} <span className="text-gray-400 mx-2">→</span> {expense.beneficiaries.map(b => b.userName).join(', ')}
                  </p>
                  {expense.memo && (
                    <p className="text-sm text-gray-600 mt-2">{expense.memo}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">¥{expense.amount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExpenseList
