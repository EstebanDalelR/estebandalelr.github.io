"use client";
import { useState, useEffect } from "react";

interface Friend {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: string;
}

interface GroupData {
  friends: Friend[];
  expenses: Expense[];
}

export default function MoneyRoute() {
  const [groupData, setGroupData] = useState<GroupData>({
    friends: [],
    expenses: [],
  });
  const [newFriendName, setNewFriendName] = useState("");
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitBetween: [] as string[],
  });
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("moneyGroupData");
    if (saved) {
      try {
        setGroupData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load data:", e);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("moneyGroupData", JSON.stringify(groupData));
  }, [groupData]);

  const addFriend = () => {
    if (!newFriendName.trim()) return;
    const newFriend: Friend = {
      id: Date.now().toString(),
      name: newFriendName.trim(),
    };
    setGroupData((prev) => ({
      ...prev,
      friends: [...prev.friends, newFriend],
    }));
    setNewFriendName("");
  };

  const removeFriend = (friendId: string) => {
    setGroupData((prev) => ({
      ...prev,
      friends: prev.friends.filter((f) => f.id !== friendId),
      expenses: prev.expenses.filter((e) =>
        e.paidBy !== friendId && !e.splitBetween.includes(friendId)
      ),
    }));
  };

  const addExpense = () => {
    if (
      !newExpense.description.trim() ||
      !newExpense.amount ||
      !newExpense.paidBy ||
      newExpense.splitBetween.length === 0
    ) {
      alert("Please fill all fields");
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description.trim(),
      amount: parseFloat(newExpense.amount),
      paidBy: newExpense.paidBy,
      splitBetween: newExpense.splitBetween,
      date: new Date().toISOString(),
    };

    setGroupData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, expense],
    }));

    setNewExpense({
      description: "",
      amount: "",
      paidBy: "",
      splitBetween: [],
    });
    setShowAddExpense(false);
  };

  const deleteExpense = (expenseId: string) => {
    setGroupData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== expenseId),
    }));
  };

  const toggleSplitBetween = (friendId: string) => {
    setNewExpense((prev) => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(friendId)
        ? prev.splitBetween.filter((id) => id !== friendId)
        : [...prev.splitBetween, friendId],
    }));
  };

  const calculateBalances = () => {
    const balances: { [key: string]: number } = {};
    groupData.friends.forEach((friend) => {
      balances[friend.id] = 0;
    });

    groupData.expenses.forEach((expense) => {
      const splitAmount = expense.amount / expense.splitBetween.length;

      // The payer gets credited
      balances[expense.paidBy] += expense.amount;

      // Everyone who shares the expense gets debited
      expense.splitBetween.forEach((friendId) => {
        balances[friendId] -= splitAmount;
      });
    });

    return balances;
  };

  const balances = calculateBalances();

  const getSettlements = () => {
    const settlements: { from: string; to: string; amount: number }[] = [];
    const balancesCopy = { ...balances };

    // Create arrays of debtors and creditors
    const debtors = Object.entries(balancesCopy)
      .filter(([_, amount]) => amount < -0.01)
      .map(([id, amount]) => ({ id, amount: -amount }))
      .sort((a, b) => b.amount - a.amount);

    const creditors = Object.entries(balancesCopy)
      .filter(([_, amount]) => amount > 0.01)
      .map(([id, amount]) => ({ id, amount }))
      .sort((a, b) => b.amount - a.amount);

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: parseFloat(amount.toFixed(2)),
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return settlements;
  };

  const settlements = getSettlements();

  const getFriendName = (id: string) => {
    return groupData.friends.find((f) => f.id === id)?.name || "Unknown";
  };

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      setGroupData({ friends: [], expenses: [] });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Group Expenses
          </h1>
          <p className="text-gray-600">Track and split expenses with friends</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Friends Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Friends</h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Friend's name"
                value={newFriendName}
                onChange={(e) => setNewFriendName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addFriend()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={addFriend}
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {groupData.friends.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No friends added yet</p>
              ) : (
                groupData.friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-800">{friend.name}</span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-semibold ${
                          balances[friend.id] > 0.01
                            ? "text-emerald-600"
                            : balances[friend.id] < -0.01
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {balances[friend.id] > 0.01
                          ? `+$${balances[friend.id].toFixed(2)}`
                          : balances[friend.id] < -0.01
                          ? `-$${Math.abs(balances[friend.id]).toFixed(2)}`
                          : "$0.00"}
                      </span>
                      <button
                        onClick={() => removeFriend(friend.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Settlements Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Settlements</h2>

            {settlements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">All settled up! 🎉</p>
            ) : (
              <div className="space-y-3">
                {settlements.map((settlement, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-800">
                          {getFriendName(settlement.from)}
                        </span>
                        <span className="text-gray-600 mx-2">→</span>
                        <span className="font-semibold text-gray-800">
                          {getFriendName(settlement.to)}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-emerald-600">
                        ${settlement.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
            <button
              onClick={() => setShowAddExpense(!showAddExpense)}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              {showAddExpense ? "Cancel" : "Add Expense"}
            </button>
          </div>

          {showAddExpense && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Description"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, description: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid by
                </label>
                <select
                  value={newExpense.paidBy}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, paidBy: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select who paid</option>
                  {groupData.friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Split between
                </label>
                <div className="flex flex-wrap gap-2">
                  {groupData.friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => toggleSplitBetween(friend.id)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        newExpense.splitBetween.includes(friend.id)
                          ? "bg-teal-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {friend.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={addExpense}
                className="w-full px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold"
              >
                Add Expense
              </button>
            </div>
          )}

          <div className="space-y-3">
            {groupData.expenses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No expenses yet</p>
            ) : (
              [...groupData.expenses].reverse().map((expense) => (
                <div
                  key={expense.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-800">
                          {expense.description}
                        </h3>
                        <span className="text-lg font-bold text-teal-600">
                          ${expense.amount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Paid by <span className="font-medium">{getFriendName(expense.paidBy)}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Split between:{" "}
                        {expense.splitBetween.map(getFriendName).join(", ")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(expense.date).toLocaleDateString()} at{" "}
                        {new Date(expense.date).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-4"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Clear Data Button */}
        <div className="text-center">
          <button
            onClick={clearAllData}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
