// Mock API service for transaction form data
const API = {
    // Mock API endpoint for client accounts
    getClientAccounts: () =>
      new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
          // 95% success rate
          if (Math.random() < 0.95) {
            resolve([
              { id: "client1", name: "John Doe - #12345" },
              { id: "client2", name: "Jane Smith - #67890" },
              { id: "client3", name: "Robert Johnson - #54321" },
              { id: "client4", name: "Emily Williams - #98765" },
              { id: "client5", name: "Michael Brown - #24680" },
            ])
          } else {
            reject({ error: "Failed to fetch client accounts", status: 500 })
          }
        }, 700) // 700ms delay
      }),
  
    // Mock API endpoint for payee accounts
    getPayeeAccounts: () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.95) {
            resolve([
              { id: "payee1", name: "ABC Limited, JPMORGAN CHASE BANK N.A., *3456, USD" },
              { id: "payee2", name: "XYZ Corp, BANK OF AMERICA, *7890, USD" },
              { id: "payee3", name: "Global Inc, CITIBANK, *1234, EUR" },
              { id: "payee4", name: "Tech Solutions, WELLS FARGO, *5678, USD" },
              { id: "payee5", name: "Acme Corp, HSBC, *9012, GBP" },
            ])
          } else {
            reject({ error: "Failed to fetch payee accounts", status: 500 })
          }
        }, 800) // 800ms delay
      }),
  
    // Mock API endpoint for transaction types
    getTransactionTypes: () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.95) {
            resolve([
              { id: "cash", name: "1 – Cash" },
              { id: "wire", name: "2 – Wire" },
              { id: "check", name: "3 – Check" },
              { id: "ach", name: "4 – ACH" },
              { id: "internal", name: "5 – Internal Transfer" },
            ])
          } else {
            reject({ error: "Failed to fetch transaction types", status: 500 })
          }
        }, 500) // 500ms delay
      }),
  
    // Mock API endpoint for currencies
    getCurrencies: () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.95) {
            resolve([
              { id: "USD", name: "USD" },
              { id: "EUR", name: "EUR" },
              { id: "GBP", name: "GBP" },
              { id: "JPY", name: "JPY" },
              { id: "CAD", name: "CAD" },
              { id: "AUD", name: "AUD" },
              { id: "CHF", name: "CHF" },
            ])
          } else {
            reject({ error: "Failed to fetch currencies", status: 500 })
          }
        }, 600) // 600ms delay
      }),
  
    // Mock API endpoint for disbursement reasons
    getReasons: () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.95) {
            resolve([
              { id: "gift", name: "Gift" },
              { id: "investment", name: "Investment" },
              { id: "expense", name: "Expense" },
              { id: "salary", name: "Salary" },
              { id: "dividend", name: "Dividend" },
              { id: "refund", name: "Refund" },
              { id: "other", name: "Other" },
            ])
          } else {
            reject({ error: "Failed to fetch reasons", status: 500 })
          }
        }, 550) // 550ms delay
      }),
  
    // Mock API endpoint for phone numbers
    getPhoneNumbers: () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.95) {
            resolve([
              { id: "phone1", name: "Home Voice 1 (+91 78220218505)" },
              { id: "phone2", name: "Mobile (+91 98765432109)" },
              { id: "phone3", name: "Office (+91 11223344556)" },
              { id: "phone4", name: "Secondary (+91 45678901234)" },
            ])
          } else {
            reject({ error: "Failed to fetch phone numbers", status: 500 })
          }
        }, 650) // 650ms delay
      }),
  
    // Mock API endpoint for account balances
    getAccountBalances: () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.95) {
            resolve({
              cashAvailable: 75568.42,
              withdrawalLimit: 100000.0,
            })
          } else {
            reject({ error: "Failed to fetch account balances", status: 500 })
          }
        }, 750) // 750ms delay
      }),
  
    // Mock API endpoint for submitting transaction
    submitTransaction: (formData) =>
      new Promise((resolve, reject) => {
        // Simulate API call delay
        setTimeout(() => {
          // Simulate successful API response 90% of the time
          if (Math.random() < 0.9) {
            resolve({
              success: true,
              message: "Transaction processed successfully",
              transactionId: "TRX" + Math.floor(Math.random() * 1000000),
              timestamp: new Date().toISOString(),
            })
          } else {
            // Simulate different types of API errors
            const errorTypes = [
              { message: "Server error: Unable to process transaction. Please try again.", status: 500 },
              { message: "Validation error: Transaction amount exceeds daily limit.", status: 400 },
              { message: "Authentication error: Session expired. Please log in again.", status: 401 },
              { message: "Service unavailable: Transaction service is currently down for maintenance.", status: 503 },
            ]
  
            const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)]
            reject({
              success: false,
              message: randomError.message,
              status: randomError.status,
            })
          }
        }, 1500) // 1.5 second delay
      }),
  }
  
