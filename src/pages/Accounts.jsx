import { useState } from "react"
import { Plus, Trash2, Wallet } from "lucide-react"

import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Modal from "../components/ui/Modal"
import { useExpenses } from "../context/ExpensesContext"
import accountsService from "../services/accountsService"
import { calculateAccountBalance, calculateAccountIncome, calculateAccountSpend } from "../utils/accountBalance"

const Accounts = () => {
  const { expenses } = useExpenses()
  const [accounts, setAccounts] = useState(() => accountsService.getAccounts())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newAccount, setNewAccount] = useState({ name: "", icon: "💰", openingBalance: "" })

  const [editingAccount, setEditingAccount] = useState(null)
  const [balanceInput, setBalanceInput] = useState("")

  const handleAddAccount = () => {
    if (!newAccount.name.trim()) return
    const nextAccounts = accountsService.addAccount({
      name: newAccount.name,
      icon: newAccount.icon,
      openingBalance: newAccount.openingBalance,
    })
    setAccounts(nextAccounts)
    setNewAccount({ name: "", icon: "💰", openingBalance: "" })
    setIsAddModalOpen(false)
  }

  const handleDeleteAccount = (id) => {
    const nextAccounts = accountsService.deleteAccount(id)
    setAccounts(nextAccounts)
  }

  const openBalanceModal = (account) => {
    setEditingAccount(account)
    setBalanceInput(String(account.openingBalance ?? 0))
  }

  const handleSaveBalance = () => {
    if (!editingAccount) return
    const parsed = Number.parseFloat(balanceInput)
    if (!Number.isFinite(parsed)) return
    const nextAccounts = accountsService.updateAccount(editingAccount.id, { openingBalance: parsed })
    setAccounts(nextAccounts)
    setEditingAccount(null)
  }

  return (
    <div className="space-y-6">
      <div className="theme-hero rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/20 p-2">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-h1">Wallets & Accounts</h1>
            <p className="text-body mt-1 opacity-90">
              Track cash, bank, and card spending separately
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-h2 theme-text">Your Accounts</h2>
          <Button size="sm" className="flex w-full items-center gap-2 sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            Add Account
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const balance = calculateAccountBalance(account, expenses)
            const spent = calculateAccountSpend(account, expenses)
            const income = calculateAccountIncome(account, expenses)

            return (
              <Card key={account.id} padding="lg" className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                      style={{ background: "var(--surface-muted)" }}
                    >
                      {account.icon}
                    </div>
                    <div>
                      <h3 className="text-body-strong theme-text">{account.name}</h3>
                      <p className="text-caption theme-muted-text">
                        <span style={{ color: "var(--positive-color)" }} className="tabular-nums">+ Rs {income.toLocaleString()}</span>
                        {" · "}
                        <span style={{ color: "var(--negative-color)" }} className="tabular-nums">− Rs {spent.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                  {accounts.length > 1 ? (
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="shrink-0 theme-muted-text transition-colors hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : null}
                </div>

                <div>
                  <p className="text-h2 tabular-nums theme-text">
                    Rs {balance.toLocaleString()}
                  </p>
                  <p className="text-caption theme-muted-text">
                    Opening Rs {(Number(account.openingBalance) || 0).toLocaleString()} + Income − Spent
                  </p>
                </div>

                <button
                  onClick={() => openBalanceModal(account)}
                  className="text-caption font-medium theme-accent-text hover:underline"
                >
                  Set opening balance
                </button>
              </Card>
            )
          })}
        </div>
      </section>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Account">
        <div className="space-y-4">
          <Input
            label="Account Name"
            placeholder="e.g., Savings Account"
            value={newAccount.name}
            onChange={(e) => setNewAccount((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Icon (emoji, optional)"
            placeholder="💰"
            maxLength={4}
            value={newAccount.icon}
            onChange={(e) => setNewAccount((p) => ({ ...p, icon: e.target.value }))}
          />
          <Input
            label="Opening balance (optional)"
            type="number"
            placeholder="0"
            value={newAccount.openingBalance}
            onChange={(e) => setNewAccount((p) => ({ ...p, openingBalance: e.target.value }))}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddAccount} className="flex-1">
              Add Account
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(editingAccount)}
        onClose={() => setEditingAccount(null)}
        title={`Set Balance — ${editingAccount?.name || ""}`}
      >
        <div className="space-y-4">
          <Input
            label="Opening balance (Rs)"
            type="number"
            value={balanceInput}
            onChange={(e) => setBalanceInput(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setEditingAccount(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveBalance} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Accounts