
import { useState } from "react";
import * as SDK from '../webSdk'
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/user.slice';

export const Transfer = () => {
  const user = useSelector(selectUser)
  
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')

  const transfer = async () => {
    await SDK.transfer({ to, amount })
  }

  return (
    <div className="p-8 flex items-center justify-center bg-white">
      <div className="w-full max-w-xs mx-auto space-y-4">
        <div>
          <label htmlFor="from" className="flex text-sm font-medium text-gray-700">From</label>
          <div className="mt-1">
            <input
              type="text"
              name="from"
              id="from"
              className="shadow-sm border focus:ring focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 outline-none"
              disabled={true}
              placeholder="Please login"
              value={user.actor}
            />
          </div>
        </div>

        <div>
          <label htmlFor="to" className="flex text-sm font-medium text-gray-700">To</label>
          <div className="mt-1">
            <input
              type="text"
              name="to"
              id="to"
              className="shadow-sm border focus:ring focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 outline-none"
              placeholder="e.g. token.burn"
              value={to}
              onInput={input => setTo(input.currentTarget.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="flex text-sm font-medium text-gray-700">Amount</label>
          <div className="mt-1">
            <input
              type="text"
              name="amount"
              id="amount"
              className="shadow-sm border focus:ring focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 outline-none"
              placeholder="e.g. 1.3"
              value={amount}
              onInput={input => setAmount(input.currentTarget.value)}
            />
          </div>
        </div>

        <div>
          <button
            onClick={() => transfer()}
            disabled={!user.actor}
            className="cursor-pointer disabled:cursor-not-allowed whitespace-nowrap bg-purple-100 border border-transparent rounded-md py-2 px-4 inline-flex items-center justify-center text-base font-medium text-purple-600 hover:bg-purple-200 disabled:opacity-50"
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  )
}