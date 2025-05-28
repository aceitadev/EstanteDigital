// Dados de exemplo para demonstração
const loans = []

// Variável para armazenar o empréstimo selecionado para devolução
let selectedLoanId = null

// Função para carregar os empréstimos
async function loadLoans() {
    try {
        let loans = await window.electron.getLoans()
        if (!loans || !Array.isArray(loans)) {
            loans = []
        }

        console.log(loans)

        updateStats(loans)
        renderLoansTable(loans)
    } catch (error) {
        console.error("Erro ao carregar empréstimos:", error)
        showNotification("Erro", "Não foi possível carregar os empréstimos.", "error")
    }
}

// Função para atualizar as estatísticas
function updateStats(loans) {
    const totalLoans = loans.length
    const activeLoans = loans.filter((loan) => loan.status === "active").length
    const overdueLoans = loans.filter((loan) => loan.status === "overdue").length

    document.getElementById("total-loans").textContent = totalLoans
    document.getElementById("active-loans").textContent = activeLoans
    document.getElementById("overdue-loans").textContent = overdueLoans
}

function renderLoansTable(loans) {
    const table = document.getElementById("tbody")
    table.innerHTML = ""

    if (loans.length === 0) {
        const row = document.createElement("tr")
        row.innerHTML = `
        <td colspan="6" style="text-align: center;">Nenhum empréstimo encontrado</td>
      `
        table.appendChild(row)
        return
    }

    loans.forEach((loan) => {
        const row = document.createElement("tr")

        const loanDate = formatDate(loan.loan_date)
        const dueDate = formatDate(loan.due_date)

        let statusText, statusClass
        switch (loan.status) {
            case "active":
                statusText = "Ativo"
                statusClass = "status-active"
                break
            case "overdue":
                statusText = "Atrasado"
                statusClass = "status-overdue"
                break
            case "returned":
                statusText = "Devolvido"
                statusClass = "status-returned"
                break
        }

        row.innerHTML = `
        <td>${loan.student_name}</td>
        <td>${loan.book_title}</td>
        <td>${loanDate}</td>
        <td>${dueDate}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td class="actions">
          ${loan.status !== "returned"
                ? `<img src="../../assets/icons/pen.png" alt="Devolver" class="return-btn" title="Registrar Devolução">`
                : ""
            }
          <img src="../../assets/icons/bin.png" alt="Remover" class="delete-btn" title="Remover Registro">
        </td>
      `

        const returnBtn = row.querySelector(".return-btn")
        if (returnBtn) {
            returnBtn.addEventListener("click", () => openReturnModal(loan))
        }

        row.querySelector(".delete-btn").addEventListener("click", () => removeLoan(loan.id))

        table.appendChild(row)
    })
}

// Função para formatar a data
function formatDate(dateString) {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

// Função para pesquisar empréstimos
function search() {
    const input = document.getElementById("search-input").value.toLowerCase()

    const filteredLoans = loans.filter((loan) => {
        return loan.student_name.toLowerCase().includes(input) || loan.book_title.toLowerCase().includes(input)
    })

    renderLoansTable(filteredLoans)

    if (filteredLoans.length === 0 && input !== "") {
        showNotification("Nenhum resultado", "Nenhum empréstimo encontrado com os termos pesquisados.", "error")
    }
}

// Função para abrir o modal de devolução
function openReturnModal(loan) {
    selectedLoanId = loan.id

    document.getElementById("return-book-title").textContent = loan.book_title
    document.getElementById("return-student-name").textContent = loan.student_name
    document.getElementById("return-loan-date").textContent = formatDate(loan.loan_date)
    document.getElementById("return-due-date").textContent = formatDate(loan.due_date)

    const modal = document.getElementById("return-modal")
    modal.style.display = "flex"

    setTimeout(() => {
        document.querySelector(".modal-container").classList.add("active")
    }, 10)
}

// Função para fechar o modal de devolução
function closeReturnModal() {
    const modalContainer = document.querySelector(".modal-container")
    modalContainer.classList.add("closing")
    selectedLoanId = null

    setTimeout(() => {
        document.getElementById("return-modal").style.display = "none"
        modalContainer.classList.remove("closing")
        modalContainer.classList.remove("active")
    }, 200)
}

// Função para confirmar a devolução
async function confirmReturn() {
    if (!selectedLoanId) return

    try {
        const result = await window.electron.returnLoan(selectedLoanId)

        if (result && result.success) {
            closeReturnModal()
            loadLoans()
            showNotification("Devolução registrada", "O livro foi devolvido com sucesso!", "success")
        } else {
            showNotification("Erro", result.message || "Erro ao registrar devolução.", "error")
        }
    } catch (error) {
        console.error("Erro ao registrar devolução:", error)
        showNotification("Erro", "Não foi possível registrar a devolução.", "error")
    }
}

// Função para remover um empréstimo
async function removeLoan(id) {
    if (!confirm("Tem certeza que deseja remover este registro de empréstimo?")) return

    try {
        const result = await window.electron.removeLoan(id)

        if (result && result.success) {
            loadLoans()
            showNotification("Registro removido", "O registro de empréstimo foi removido com sucesso.", "success")
        } else {
            showNotification("Erro", result.message || "Erro ao remover empréstimo.", "error")
        }
    } catch (error) {
        console.error("Erro ao remover empréstimo:", error)
        showNotification("Erro", "Não foi possível remover o empréstimo.", "error")
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

// Event listener para a tecla Enter no campo de pesquisa
document.getElementById("search-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        search()
    }
})

// Carregar os empréstimos ao iniciar a página
loadLoans()
