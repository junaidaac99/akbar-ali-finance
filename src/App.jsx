import React, { useState, useEffect } from 'react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [page, setPage] = useState("dashboard");

  // Global Quick Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [globalDate, setGlobalDate] = useState(new Date().toISOString().split('T')[0]);
  const [globalType, setGlobalType] = useState("expense");
  const [globalDetail, setGlobalDetail] = useState("");
  const [globalAmount, setGlobalAmount] = useState("");
  const [globalProject, setGlobalProject] = useState("");
  const [globalBank, setGlobalBank] = useState("");

  // Bank Accounts States
  const [bankAccounts, setBankAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem("akbar_bankAccounts");
      return saved ? JSON.parse(saved) : [
        { name: "Meezan Bank", number: "08820106894318", balance: 30000, source: "Company Firm" },
        { name: "Cash", number: "N/A", balance: 3000, source: "Company Firm" }
      ];
    } catch {
      return [{ name: "Meezan Bank", number: "08820106894318", balance: 30000, source: "Company Firm" }];
    }
  });

  // Bank Account Transactions History
  const [bankTransactions, setBankTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("akbar_bankTransactions");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Projects States (By default 'Tank Factory HIT' taake blank na lage)
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem("akbar_projects");
      return saved ? JSON.parse(saved) : [
        {
          name: "Tank Factory HIT",
          client: "N/A",
          budget: 0,
          entries: [
            { date: "2026-09-08", detail: "Labor lunch", income: 0, expense: 1100 },
            { date: "2026-09-08", detail: "Car fuel", income: 0, expense: 2000 }
          ]
        }
      ];
    } catch {
      return [];
    }
  });
  const [selectedProject, setSelectedProject] = useState(null);

  // Employees States
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem("akbar_employees");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Context Menu & Editing States
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, entryIndex: null, projName: null });
  const [copiedData, setCopiedData] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  // Save to LocalStorage safely
  useEffect(() => {
    localStorage.setItem("akbar_bankAccounts", JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem("akbar_bankTransactions", JSON.stringify(bankTransactions));
  }, [bankTransactions]);

  useEffect(() => {
    localStorage.setItem("akbar_projects", JSON.stringify(projects));
    if (selectedProject) {
      const updatedCurrent = projects.find(p => p.name === selectedProject.name);
      if (updatedCurrent) setSelectedProject(updatedCurrent);
    }
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("akbar_employees", JSON.stringify(employees));
  }, [employees]);

  // Hide context menu on global click
  useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, entryIndex: null, projName: null });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const totalBankBalance = bankAccounts.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);
  const totalIncome = projects.reduce((acc, p) => acc + p.entries.reduce((sum, e) => sum + Number(e.income || 0), 0), 0);
  const totalExpense = projects.reduce((acc, p) => acc + p.entries.reduce((sum, e) => sum + Number(e.expense || 0), 0), 0);

  // Handle Right-Click on Project Entry
  const handleContextMenu = (e, projName, index) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      entryIndex: index,
      projName: projName
    });
  };

  // Handle Delete Entry
  const handleDeleteEntry = (projName, index) => {
    const updatedProjects = projects.map(p => {
      if (p.name === projName) {
        const updatedEntries = [...p.entries];
        updatedEntries.splice(index, 1);
        return { ...p, entries: updatedEntries };
      }
      return p;
    });
    setProjects(updatedProjects);
    setContextMenu({ visible: false, x: 0, y: 0, entryIndex: null, projName: null });
  };

  // Handle Edit Trigger
  const handleStartEdit = (projName, index) => {
    const proj = projects.find(p => p.name === projName);
    if (proj && proj.entries[index]) {
      const entry = proj.entries[index];
      setEditingEntry({ projName, index, ...entry });
    }
    setContextMenu({ visible: false, x: 0, y: 0, entryIndex: null, projName: null });
  };

  // Save Edited Entry
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const { projName, index, date, detail, income, expense } = editingEntry;
    
    const updatedProjects = projects.map(p => {
      if (p.name === projName) {
        const updatedEntries = [...p.entries];
        updatedEntries[index] = { date, detail, income: Number(income || 0), expense: Number(expense || 0) };
        return { ...p, entries: updatedEntries };
      }
      return p;
    });

    setProjects(updatedProjects);
    setEditingEntry(null);
  };

  // Handle Copy Entry
  const handleCopy = (projName, index) => {
    const proj = projects.find(p => p.name === projName);
    if (proj && proj.entries[index]) {
      setCopiedData(proj.entries[index]);
      alert("Entry Copied!");
    }
    setContextMenu({ visible: false, x: 0, y: 0, entryIndex: null, projName: null });
  };

  // Handle Paste Entry
  const handlePaste = (projName) => {
    if (!copiedData) {
      alert("Pehle koi entry Copy karein!");
      return;
    }
    const updatedProjects = projects.map(p => {
      if (p.name === projName) {
        return { ...p, entries: [copiedData, ...p.entries] };
      }
      return p;
    });
    setProjects(updatedProjects);
    setContextMenu({ visible: false, x: 0, y: 0, entryIndex: null, projName: null });
  };

  // Handle Global Quick Add Form Submission
  const handleGlobalSubmit = (e) => {
    e.preventDefault();
    if (!globalDetail.trim() || !globalAmount || !globalProject || !globalBank) {
      alert("Detail, Amount, Project aur Bank/Cash select karein!");
      return;
    }

    const amt = Number(globalAmount);
    const newEntry = {
      date: globalDate,
      detail: globalDetail,
      income: globalType === "income" ? amt : 0,
      expense: globalType === "expense" ? amt : 0
    };

    const updatedProjects = projects.map(p => {
      if (p.name === globalProject) {
        return { ...p, entries: [newEntry, ...p.entries] };
      }
      return p;
    });
    setProjects(updatedProjects);

    const updatedAccounts = bankAccounts.map(acc => {
      if (acc.name === globalBank) {
        return { ...acc, balance: globalType === "income" ? Number(acc.balance) + amt : Number(acc.balance) - amt };
      }
      return acc;
    });
    setBankAccounts(updatedAccounts);

    setBankTransactions([{
      bankName: globalBank,
      date: globalDate,
      type: globalType,
      detail: globalDetail,
      amount: amt,
      project: globalProject
    }, ...bankTransactions]);

    setGlobalDetail("");
    setGlobalAmount("");
    setGlobalProject("");
    setGlobalBank("");
    setIsModalOpen(false);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0f172a", fontFamily: "sans-serif" }}>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (username === "admin" && password === "12345") setIsLoggedIn(true);
          else alert("Ghalat Username ya Password!");
        }} style={{ background: "#1e293b", padding: "30px", borderRadius: "10px", width: "320px", color: "white" }}>
          <h2 style={{ textAlign: "center", color: "#38bdf8" }}>Akbar Ali & Co</h2>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", fontSize: "14px" }}>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", padding: "10px", background: "#0f172a", color: "white", border: "1px solid #334155", borderRadius: "6px" }} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "10px", background: "#0f172a", color: "white", border: "1px solid #334155", borderRadius: "6px" }} />
          </div>
          <button type="submit" style={{ width: "100%", padding: "10px", background: "#38bdf8", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif", backgroundColor: "#f8fafc" }}>
      {/* Sidebar */}
      <div style={{ width: "260px", backgroundColor: "#0f172a", color: "white", padding: "24px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "20px", color: "#38bdf8", margin: "0" }}>Akbar Ali & Co</h1>
          <p style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "25px" }}>ACCOUNT & PROJECT FINANCE</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div onClick={() => { setPage("dashboard"); setSelectedProject(null); }} style={{ padding: "10px", cursor: "pointer", background: page === "dashboard" ? "#38bdf8" : "transparent", color: page === "dashboard" ? "#000" : "#fff", borderRadius: "6px" }}>Dashboard</div>
            <div onClick={() => { setPage("bankAccounts"); setSelectedProject(null); }} style={{ padding: "10px", cursor: "pointer", background: page === "bankAccounts" ? "#38bdf8" : "transparent", color: page === "bankAccounts" ? "#000" : "#fff", borderRadius: "6px" }}>Bank Accounts & Cash</div>
            <div onClick={() => { setPage("projects"); setSelectedProject(null); }} style={{ padding: "10px", cursor: "pointer", background: page === "projects" ? "#38bdf8" : "transparent", color: page === "projects" ? "#000" : "#fff", borderRadius: "6px" }}>Projects & Categories</div>
            <div onClick={() => { setPage("transactions"); setSelectedProject(null); }} style={{ padding: "10px", cursor: "pointer", background: page === "transactions" ? "#38bdf8" : "transparent", color: page === "transactions" ? "#000" : "#fff", borderRadius: "6px" }}>Fund In / Transactions</div>
            <div onClick={() => { setPage("reports"); setSelectedProject(null); }} style={{ padding: "10px", cursor: "pointer", background: page === "reports" ? "#38bdf8" : "transparent", color: page === "reports" ? "#000" : "#fff", borderRadius: "6px" }}>Reports</div>
            <div onClick={() => { setPage("audit"); setSelectedProject(null); }} style={{ padding: "10px", cursor: "pointer", background: page === "audit" ? "#38bdf8" : "transparent", color: page === "audit" ? "#000" : "#fff", borderRadius: "6px" }}>Audit</div>
            <div onClick={() => { setPage("employees"); setSelectedProject(null); }} style={{ padding: "10px", cursor: "pointer", background: page === "employees" ? "#38bdf8" : "transparent", color: page === "employees" ? "#000" : "#fff", borderRadius: "6px" }}>Employees</div>
          </div>
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "#64748b" }}>{employees.length} Employees • {projects.length} Projects</p>
          <button onClick={() => setIsLoggedIn(false)} style={{ width: "100%", padding: "10px", background: "#334155", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "10px" }}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ background: "white", padding: "15px 30px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "600", color: "#475569" }}>Quick Access Panel</span>
          <button onClick={() => setIsModalOpen(true)} style={{ background: "#0284c7", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>➕ Add Entry</button>
        </div>

        {/* Dashboard Page */}
        {page === "dashboard" && (
          <div style={{ padding: "30px" }}>
            <h2>Dashboard</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "20px" }}>
              <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                <h4>Total Bank Balance</h4>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: "#0284c7" }}>{totalBankBalance} PKR</p>
              </div>
              <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                <h4>Total Income</h4>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: "#16a34a" }}>{totalIncome} PKR</p>
              </div>
              <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                <h4>Total Expense</h4>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: "#dc2626" }}>{totalExpense} PKR</p>
              </div>
            </div>
          </div>
        )}

        {/* Bank Accounts Page */}
        {page === "bankAccounts" && (
          <div style={{ padding: "30px" }}>
            <h2>Bank Accounts & Cash</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginTop: "20px" }}>
              {bankAccounts.map((acc, idx) => (
                <div key={idx} style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                  <h3>{acc.name}</h3>
                  <p style={{ color: "#64748b" }}>Account No: {acc.number}</p>
                  <p style={{ fontSize: "20px", fontWeight: "bold" }}>Balance: {acc.balance} PKR</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Page */}
        {page === "projects" && (
          <div style={{ padding: "30px" }}>
            {!selectedProject ? (
              <div>
                <h2>Projects & Categories</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "20px" }}>
                  {projects.map((proj, idx) => (
                    <div key={idx} style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                      <h3>{proj.name}</h3>
                      <p style={{ fontSize: "13px", color: "#64748b" }}>Client: {proj.client || "N/A"}</p>
                      <button onClick={() => setSelectedProject(proj)} style={{ width: "100%", marginTop: "15px", padding: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>View Ledger ➔</button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <button onClick={() => setSelectedProject(null)} style={{ background: "none", border: "none", color: "#0284c7", fontWeight: "bold", cursor: "pointer", marginBottom: "15px" }}>← Back to Projects</button>
                <h2>{selectedProject.name} (Ledger)</h2>
                <p style={{ color: "#64748b", marginBottom: "20px" }}>Client: {selectedProject.client || "N/A"} | Budget: {selectedProject.budget || 0} PKR</p>

                {/* Ledger Table */}
                <div style={{ background: "white", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "12px" }}>Date</th>
                        <th style={{ padding: "12px" }}>Detail</th>
                        <th style={{ padding: "12px" }}>Income (+)</th>
                        <th style={{ padding: "12px" }}>Expense (-)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.entries.map((ent, idx) => (
                        <tr 
                          key={idx} 
                          onContextMenu={(e) => handleContextMenu(e, selectedProject.name, idx)}
                          onDoubleClick={() => handleStartEdit(selectedProject.name, idx)}
                          style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", userSelect: "none" }}
                        >
                          <td style={{ padding: "12px" }}>{ent.date}</td>
                          <td style={{ padding: "12px", fontWeight: "500" }}>{ent.detail}</td>
                          <td style={{ padding: "12px", color: "#16a34a", fontWeight: "bold" }}>{ent.income ? `${ent.income} PKR` : "-"}</td>
                          <td style={{ padding: "12px", color: "#dc2626", fontWeight: "bold" }}>{ent.expense ? `${ent.expense} PKR` : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions Page */}
        {page === "transactions" && (
          <div style={{ padding: "30px" }}>
            <h2>Fund In / Transactions History</h2>
            <div style={{ background: "white", borderRadius: "10px", marginTop: "20px", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "12px" }}>Date</th>
                    <th style={{ padding: "12px" }}>Bank / Cash</th>
                    <th style={{ padding: "12px" }}>Project</th>
                    <th style={{ padding: "12px" }}>Detail</th>
                    <th style={{ padding: "12px" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bankTransactions.map((tx, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px" }}>{tx.date}</td>
                      <td style={{ padding: "12px" }}>{tx.bankName}</td>
                      <td style={{ padding: "12px" }}>{tx.project}</td>
                      <td style={{ padding: "12px" }}>{tx.detail}</td>
                      <td style={{ padding: "12px", fontWeight: "bold", color: tx.type === "income" ? "#16a34a" : "#dc2626" }}>{tx.amount} PKR</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Page */}
        {page === "reports" && <div style={{ padding: "30px" }}><h2>Reports</h2><p>Financial reports overview.</p></div>}
        
        {/* Audit Page */}
        {page === "audit" && <div style={{ padding: "30px" }}><h2>Audit Log</h2><p>System tracking and security audit logs.</p></div>}

        {/* Employees Page */}
        {page === "employees" && (
          <div style={{ padding: "30px" }}>
            <h2>Employees Management</h2>
            <p style={{ color: "#64748b" }}>Total Registered Employees: {employees.length}</p>
          </div>
        )}
      </div>

      {/* Right Click Context Menu */}
      {contextMenu.visible && (
        <div style={{
          position: "fixed",
          top: `${contextMenu.y}px`,
          left: `${contextMenu.x}px`,
          background: "white",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          width: "140px"
        }}>
          <div onClick={() => handleStartEdit(contextMenu.projName, contextMenu.entryIndex)} style={{ padding: "8px 12px", cursor: "pointer", fontSize: "14px", borderBottom: "1px solid #f1f5f9" }}>✏️ Edit</div>
          <div onClick={() => handleDeleteEntry(contextMenu.projName, contextMenu.entryIndex)} style={{ padding: "8px 12px", cursor: "pointer", fontSize: "14px", color: "red", borderBottom: "1px solid #f1f5f9" }}>🗑️ Delete</div>
          <div onClick={() => handleCopy(contextMenu.projName, contextMenu.entryIndex)} style={{ padding: "8px 12px", cursor: "pointer", fontSize: "14px", borderBottom: "1px solid #f1f5f9" }}>📋 Copy</div>
          <div onClick={() => handlePaste(contextMenu.projName)} style={{ padding: "8px 12px", cursor: "pointer", fontSize: "14px" }}>📌 Paste</div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1001 }}>
          <form onSubmit={handleSaveEdit} style={{ background: "white", padding: "25px", borderRadius: "10px", width: "350px" }}>
            <h3>Edit Entry</h3>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "12px", color: "#64748b" }}>Detail</label>
              <input type="text" value={editingEntry.detail} onChange={(e) => setEditingEntry({ ...editingEntry, detail: e.target.value })} style={{ width: "100%", padding: "8px", marginTop: "4px", border: "1px solid #cbd5e1", borderRadius: "4px" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontSize: "12px", color: "#64748b" }}>Amount</label>
              <input type="number" value={editingEntry.expense || editingEntry.income} onChange={(e) => setEditingEntry({ ...editingEntry, expense: e.target.value })} style={{ width: "100%", padding: "8px", marginTop: "4px", border: "1px solid #cbd5e1", borderRadius: "4px" }} />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setEditingEntry(null)} style={{ padding: "8px 12px", cursor: "pointer" }}>Cancel</button>
              <button type="submit" style={{ padding: "8px 12px", background: "#0284c7", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Add Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1001 }}>
          <div style={{ background: "white", padding: "25px", borderRadius: "10px", width: "400px" }}>
            <h3>Quick Add Entry</h3>
            <form onSubmit={handleGlobalSubmit}>
              <select value={globalType} onChange={(e) => setGlobalType(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
                <option value="expense">Expense (-)</option>
                <option value="income">Income (+)</option>
              </select>
              <input type="date" value={globalDate} onChange={(e) => setGlobalDate(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />
              <input type="text" placeholder="Detail (e.g. Car fuel)" value={globalDetail} onChange={(e) => setGlobalDetail(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />
              <input type="number" placeholder="Amount (PKR)" value={globalAmount} onChange={(e) => setGlobalAmount(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />
              <select value={globalProject} onChange={(e) => setGlobalProject(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
                <option value="">-- Choose Project --</option>
                {projects.map((p, idx) => <option key={idx} value={p.name}>{p.name}</option>)}
              </select>
              <select value={globalBank} onChange={(e) => setGlobalBank(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "15px" }}>
                <option value="">-- Choose Bank / Cash --</option>
                {bankAccounts.map((acc, idx) => <option key={idx} value={acc.name}>{acc.name}</option>)}
              </select>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "10px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "10px", background: "#0284c7", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}