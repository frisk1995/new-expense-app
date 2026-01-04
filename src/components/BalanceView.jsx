function BalanceView({ projectId }) {
  // TODO: Firestoreからデータを計算
  const balances = [
    { userName: '田中', balance: 3000 },
    { userName: '佐藤', balance: -3000 },
  ]

  const settlements = [
    { from: '佐藤', to: '田中', amount: 3000 }
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">収支状況</h2>
        <div className="space-y-3">
          {balances.map((balance, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg text-gray-800">{balance.userName}</span>
                <span className={`text-2xl font-bold ${balance.balance > 0 ? 'text-green-600' : balance.balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {balance.balance > 0 ? '+' : ''}¥{balance.balance.toLocaleString()}
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
