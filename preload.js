const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electron", {
    setWindow: (window) => ipcRenderer.send("set-window", window),
    sendNotification: (title, body) => ipcRenderer.send("send-notification", title, body),
    getBooks: () => ipcRenderer.invoke("get-books"),
    addBook: (title, author, category) => ipcRenderer.send("add-book", title, author, category),
    updateBook: (oldBook, newBook) => ipcRenderer.send("update-book", oldBook, newBook),
    removeBook: (title, author) => ipcRenderer.send("remove-book", title, author),
    getStudents: () => ipcRenderer.invoke("get-students"),
    addStudent: (full_name, class_id, email, phone, birthday) =>
        ipcRenderer.send("add-student", full_name, class_id, email, phone, birthday),
    updateStudent: (oldStudent, newStudent) => ipcRenderer.send("update-student", oldStudent, newStudent),
    removeStudent: (full_name, class_id, email, phone, birthday) =>
        ipcRenderer.send("remove-student", full_name, class_id, email, phone, birthday),
    getLoans: () => ipcRenderer.invoke("get-loans"),
    createLoan: (studentId, bookId, dueDate) => ipcRenderer.invoke("create-loan", { studentId, bookId, dueDate }),
    returnLoan: (loanId) => ipcRenderer.invoke("return-loan", loanId),
    removeLoan: (loanId) => ipcRenderer.invoke("remove-loan", loanId),
})
