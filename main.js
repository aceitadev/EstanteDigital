const { app, BrowserWindow, Menu, ipcMain, Notification } = require("electron")
const path = require("node:path")
const fs = require("fs")
const Database = require("better-sqlite3")

// main window
function createMainWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 640,
        minWidth: 1024,
        minHeight: 612,
        icon: path.join(__dirname, "assets", "icon.ico"),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    })

    Menu.setApplicationMenu(null);
    win.loadFile(`pages/home/index.html`)
}

// ipcMain handler
ipcMain.on("set-window", (event, windowName) => {
    const webContents = event.sender
    const window = BrowserWindow.fromWebContents(webContents)
    window.loadFile(`pages/${windowName}/index.html`)
})
ipcMain.on("send-notification", (event, title, body) => {
    sendNotification(title, body)
})
ipcMain.handle("get-books", async () => {
    return getBooks()
})
ipcMain.on("add-book", (event, title, author, category) => {
    addBook(title, author, category)
})
ipcMain.on("update-book", (event, oldBook, newBook) => {
    updateBook(oldBook, newBook)
})
ipcMain.on("remove-book", (event, title, author) => {
    removeBook(title, author)
})
ipcMain.handle("get-students", async () => {
    return getStudents()
})
ipcMain.on("add-student", (event, full_name, class_id, email, phone, birthday) => {
    addStudent(full_name, class_id, email, phone, birthday)
})
ipcMain.on("update-student", (event, oldStudent, newStudent) => {
    updateStudent(oldStudent, newStudent)
})
ipcMain.on("remove-student", (event, full_name, class_id, email, phone, birthday) => {
    removeStudent(full_name, class_id, email, phone, birthday)
})

// Novos handlers para empréstimos
ipcMain.handle("get-loans", async () => {
    return getLoans()
})
ipcMain.handle("create-loan", async (event, { studentId, bookId, dueDate }) => {
    return createLoan(studentId, bookId, dueDate)
})
ipcMain.handle("return-loan", async (event, loanId) => {
    return returnLoan(loanId)
})
ipcMain.handle("remove-loan", async (event, loanId) => {
    return removeLoan(loanId)
})

// app
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})
app.whenReady().then(() => {
    app.setAppUserModelId("aceita.estantedigital")
    loadDatabase()
    createMainWindow()
    console.log("Application started")
})

// database
function getDatabase() {
    const appDataPath = app.getPath("appData")
    const appFolder = path.join(appDataPath, "Estante Digital")
    const dbPath = path.join(appFolder, "database.db")

    if (!fs.existsSync(appFolder)) {
        fs.mkdirSync(appFolder, { recursive: true })
    }

    return new Database(dbPath)
}
function loadDatabase() {
    const db = getDatabase()

    db.prepare("PRAGMA foreign_keys = ON").run()

    db.prepare(`
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name VARCHAR(100) NOT NULL,
          class_id VARCHAR(20) NOT NULL,
          email VARCHAR(100),
          phone VARCHAR(20),
          birthday DATE,
          created_at DATETIME NOT NULL
        )
      `).run()

    db.prepare(`
        CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(100) NOT NULL,
          author VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          created_at DATETIME NOT NULL
        )
      `).run()

    db.prepare(`
        CREATE TABLE IF NOT EXISTS loans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          book_id INTEGER NOT NULL,
          loan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          due_date TIMESTAMP NOT NULL,
          return_date TIMESTAMP NULL,
          status VARCHAR(20) DEFAULT 'active',
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )
      `).run()

    console.log("Database loaded")
}

// books
function getBooks() {
    const db = getDatabase()
    const stmt = db.prepare("SELECT * FROM books")
    return stmt.all()
}
function addBook(title, author, category) {
    const db = getDatabase()

    const now = new Date()
    const gmt3Offset = -3 * 60
    const localTime = new Date(now.getTime() + (gmt3Offset - now.getTimezoneOffset()) * 60000)
    const created_at = localTime.toISOString()

    const stmt = db.prepare(`
        INSERT INTO books (title, author, category, created_at)
        VALUES (?, ?, ?, ?)
    `)
    stmt.run(title, author, category, created_at)
    console.log("Book added to the database")
}
function updateBook(oldBook, newBook) {
    const db = getDatabase()

    const findStmt = db.prepare("SELECT * FROM books WHERE title = ? AND author = ? AND category = ?")
    const existingBook = findStmt.get(oldBook.title, oldBook.author, oldBook.category)

    if (!existingBook) {
        console.log("Livro não encontrado na base de dados.")
        return
    }

    const updateStmt = db.prepare("UPDATE books SET title = ?, author = ?, category = ? WHERE id = ?")
    updateStmt.run(newBook.title, newBook.author, newBook.category, existingBook.id)

    console.log("Livro atualizado com sucesso.")
}
function removeBook(title, author) {
    const db = getDatabase()
    const stmt = db.prepare("DELETE FROM books WHERE title = ? AND author = ?")
    stmt.run(title, author)
    console.log("Book removed from the database")
}

// students
function getStudents() {
    const db = getDatabase()
    const stmt = db.prepare("SELECT * FROM students")
    return stmt.all()
}
function addStudent(full_name, class_id, email, phone, birthday) {
    const db = getDatabase()

    const now = new Date()
    const gmt3Offset = -3 * 60
    const localTime = new Date(now.getTime() + (gmt3Offset - now.getTimezoneOffset()) * 60000)
    const created_at = localTime.toISOString()

    const stmt = db.prepare(`
        INSERT INTO students (full_name, class_id, email, phone, birthday, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `)
    stmt.run(full_name, class_id, email, phone, birthday, created_at)
    console.log("Estudante adicionado ao banco de dados")
}
function updateStudent(oldStudent, newStudent) {
    const db = getDatabase()

    const findStmt = db.prepare(`
        SELECT * FROM students
        WHERE full_name = ? AND class_id = ? AND email = ? AND phone = ? AND birthday = ?
    `)
    const existingStudent = findStmt.get(
        oldStudent.full_name,
        oldStudent.class_id,
        oldStudent.email,
        oldStudent.phone,
        oldStudent.birthday,
    )

    if (!existingStudent) {
        console.log("Estudante não encontrado na base de dados.")
        return
    }

    const updateStmt = db.prepare(`
        UPDATE students
        SET full_name = ?, class_id = ?, email = ?, phone = ?, birthday = ?
        WHERE id = ?
    `)
    updateStmt.run(
        newStudent.full_name,
        newStudent.class_id,
        newStudent.email,
        newStudent.phone,
        newStudent.birthday,
        existingStudent.id,
    )

    console.log("Estudante atualizado com sucesso.")
}
function removeStudent(full_name, class_id, email, phone, birthday) {
    const db = getDatabase()
    const stmt = db.prepare(`
        DELETE FROM students
        WHERE full_name = ? AND class_id = ? AND email = ? AND phone = ? AND birthday = ?
    `)
    stmt.run(full_name, class_id, email, phone, birthday)
    console.log("Estudante removido do banco de dados")
}

// loans
function getLoans() {
    const db = getDatabase()
    const stmt = db.prepare(`
    SELECT 
      l.id, 
      l.student_id, 
      s.full_name as student_name, 
      l.book_id, 
      b.title as book_title, 
      l.loan_date, 
      l.due_date, 
      l.return_date, 
      l.status
    FROM loans l
    JOIN students s ON l.student_id = s.id
    JOIN books b ON l.book_id = b.id
    ORDER BY l.loan_date DESC
  `)

    const loans = stmt.all()

    // Atualizar status de empréstimos atrasados
    const today = new Date().toISOString().split("T")[0]
    loans.forEach((loan) => {
        if (loan.status === "active" && loan.due_date < today) {
            const updateStmt = db.prepare("UPDATE loans SET status = 'overdue' WHERE id = ?")
            updateStmt.run(loan.id)
            loan.status = "overdue"
        }
    })

    return loans
}

function createLoan(studentId, bookId, dueDate) {
    const db = getDatabase()

    // Verificar se o livro já está emprestado
    const checkStmt = db.prepare(`
    SELECT * FROM loans 
    WHERE book_id = ? AND status IN ('active', 'overdue')
  `)
    const existingLoan = checkStmt.get(bookId)

    if (existingLoan) {
        return { success: false, message: "Este livro já está emprestado." }
    }

    const stmt = db.prepare(`
    INSERT INTO loans (student_id, book_id, due_date, status)
    VALUES (?, ?, ?, 'active')
  `)

    try {
        const result = stmt.run(studentId, bookId, dueDate)
        console.log("Empréstimo registrado com sucesso.")
        return { success: true, id: result.lastInsertRowid }
    } catch (error) {
        console.error("Erro ao registrar empréstimo:", error)
        return { success: false, message: "Erro ao registrar empréstimo." }
    }
}

function returnLoan(loanId) {
    const db = getDatabase()

    const today = new Date().toISOString().split("T")[0]

    const stmt = db.prepare(`
    UPDATE loans 
    SET return_date = ?, status = 'returned' 
    WHERE id = ?
  `)

    try {
        stmt.run(today, loanId)
        console.log("Devolução registrada com sucesso.")
        return { success: true }
    } catch (error) {
        console.error("Erro ao registrar devolução:", error)
        return { success: false, message: "Erro ao registrar devolução." }
    }
}

function removeLoan(loanId) {
    const db = getDatabase()

    const stmt = db.prepare("DELETE FROM loans WHERE id = ?")

    try {
        stmt.run(loanId)
        console.log("Empréstimo removido com sucesso.")
        return { success: true }
    } catch (error) {
        console.error("Erro ao remover empréstimo:", error)
        return { success: false, message: "Erro ao remover empréstimo." }
    }
}

// send a notification
function sendNotification(title, body) {
    if (title === null || body === null) {
        console.log("Title and body are required to send a notification.")
        return
    }
    const notification = new Notification({
        title: title,
        body: body,
        icon: path.join(__dirname, "assets", "icon.ico"),
    })

    notification.show()
}
