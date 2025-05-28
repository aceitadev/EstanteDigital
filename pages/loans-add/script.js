// Variáveis para armazenar os dados dos alunos e livros
let students = []
let books = []

// Função para inicializar a página
async function initialize() {
    // Carregar alunos e livros
    await loadStudents()
    await loadBooks()

    // Configurar a data mínima para hoje
    const today = new Date().toISOString().split("T")[0]
    document.getElementById("due-date").min = today

    // Definir uma data padrão para devolução (15 dias a partir de hoje)
    const defaultDueDate = new Date()
    defaultDueDate.setDate(defaultDueDate.getDate() + 15)
    document.getElementById("due-date").value = defaultDueDate.toISOString().split("T")[0]

    // Atualizar o resumo com a data de empréstimo (hoje)
    document.getElementById("summary-loan-date").textContent = formatDate(today)
    document.getElementById("summary-due-date").textContent = formatDate(defaultDueDate.toISOString().split("T")[0])

    // Inicializar os selects customizados
    initializeCustomSelects()
}

// Função para carregar os alunos
async function loadStudents() {
    try {
        // Usar a API real em vez dos dados de exemplo
        students = await window.electron.getStudents()

        // Preencher as opções do select de alunos
        const studentOptions = document.getElementById("student-options")
        studentOptions.innerHTML = ""

        students.forEach((student) => {
            const option = document.createElement("li")
            option.setAttribute("data-value", student.id)
            option.textContent = `${student.full_name} (${student.class_id})`
            option.addEventListener("click", () => {
                updateStudentSelection(student)
            })
            studentOptions.appendChild(option)
        })
    } catch (error) {
        console.error("Erro ao carregar alunos:", error)
        showNotification("Erro", "Não foi possível carregar a lista de alunos.", "error")
    }
}

// Função para carregar os livros
async function loadBooks() {
    try {
        // Usar a API real em vez dos dados de exemplo
        books = await window.electron.getBooks()

        // Preencher as opções do select de livros
        const bookOptions = document.getElementById("book-options")
        bookOptions.innerHTML = ""

        books.forEach((book) => {
            const option = document.createElement("li")
            option.setAttribute("data-value", book.id)
            option.textContent = `${book.title} - ${book.author}`
            option.addEventListener("click", () => {
                updateBookSelection(book)
            })
            bookOptions.appendChild(option)
        })
    } catch (error) {
        console.error("Erro ao carregar livros:", error)
        showNotification("Erro", "Não foi possível carregar a lista de livros.", "error")
    }
}

// Função para atualizar a seleção de aluno
function updateStudentSelection(student) {
    document.getElementById("student").value = student.id
    document.querySelector("#student-select .selected").textContent = `${student.full_name} (${student.class_id})`
    document.getElementById("student-select").classList.add("selected")
    document.getElementById("summary-student").textContent = student.full_name
}

// Função para atualizar a seleção de livro
function updateBookSelection(book) {
    document.getElementById("book").value = book.id
    document.querySelector("#book-select .selected").textContent = `${book.title} - ${book.author}`
    document.getElementById("book-select").classList.add("selected")
    document.getElementById("summary-book").textContent = book.title
}

// Função para inicializar os selects customizados
function initializeCustomSelects() {
    const customSelects = document.querySelectorAll(".custom-select")

    customSelects.forEach((customSelect) => {
        const selected = customSelect.querySelector(".selected")

        selected.addEventListener("click", () => {
            customSelect.classList.toggle("open")
        })
    })

    // Fechar os selects quando clicar fora deles
    document.addEventListener("click", (e) => {
        customSelects.forEach((customSelect) => {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove("open")
            }
        })
    })

    // Atualizar o resumo quando a data de devolução mudar
    document.getElementById("due-date").addEventListener("change", (e) => {
        document.getElementById("summary-due-date").textContent = formatDate(e.target.value)
    })
}

// Fun��ão para formatar a data
function formatDate(dateString) {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

// Atualizar a função finish para usar a API real
async function finish(event) {
    event.preventDefault()

    const studentId = document.getElementById("student").value
    const bookId = document.getElementById("book").value
    const dueDate = document.getElementById("due-date").value

    if (!studentId || !bookId || !dueDate) {
        showNotification("Campos obrigatórios", "Por favor, preencha todos os campos.", "error")
        return
    }

    try {
        // Chamar a API para criar o empréstimo
        const result = await window.electron.createLoan(studentId, bookId, dueDate)

        if (result && result.success) {
            // Redirecionar para a página de empréstimos
            window.electron.setWindow("loans")

            // Enviar notificação
            window.electron.sendNotification("Empréstimo registrado", "O empréstimo foi registrado com sucesso.")
        } else {
            showNotification("Erro", result.message || "Erro ao registrar empréstimo.", "error")
        }
    } catch (error) {
        console.error("Erro ao registrar empréstimo:", error)
        showNotification("Erro", "Não foi possível registrar o empréstimo.", "error")
    }
}

// Função para exibir notificações
function showNotification(title, message, type = "error") {
    const existing = document.querySelector(".notification")
    if (existing) existing.remove()

    const notification = document.createElement("div")
    notification.className = `notification ${type === "success" ? "success" : ""}`

    notification.innerHTML = `
    <div class="notification-icon">${type === "success" ? "✓" : "!"}</div>
    <div>${message}</div>
  `

    document.body.appendChild(notification)

    setTimeout(() => {
        notification.remove()
    }, 3000)
}

// Inicializar a página quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", initialize)
