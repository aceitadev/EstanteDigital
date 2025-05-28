async function loadBooks() {
    const table = document.getElementById("tbody")
    const books = await window.electron.getBooks()

    table.innerHTML = ""

    if (books.length === 0) {
        const row = document.createElement("tr")
        row.innerHTML = `
              <td colspan="4" style="text-align: center;">Nenhum livro encontrado</td>
          `
        table.appendChild(row)
        return
    }

    books.forEach((book) => {
        const row = document.createElement("tr")

        row.innerHTML = `
              <td>${book.title}</td>
              <td>${book.author}</td>
              <td>${book.category}</td>
              <td class="actions">
                  <img src="../../assets/icons/pen.png" alt="Editar" class="edit-btn">
                  <img src="../../assets/icons/bin.png" alt="Remover" class="delete-btn">
              </td>
          `

        row.querySelector(".edit-btn").addEventListener("click", () => {
            openEditModal(book)
        })
        row.querySelector(".delete-btn").addEventListener("click", () => {
            removeBook(book.title, book.author)
        })

        table.appendChild(row)
    })
}

// Modificar a função removeBook para adicionar confirmação
function removeBook(title, author) {
    if (!confirm(`Tem certeza que deseja remover o livro "${title}" de ${author}?`)) return

    window.electron.removeBook(title, author)
    showNotification("Livro removido", `O livro "${title}" de ${author} foi removido com sucesso.`, "success")
    loadBooks()
}

async function search() {
    const input = document.getElementById("search-input").value.toLowerCase()
    const rows = document.getElementById("tbody")

    const books = await window.electron.getBooks()

    const values = books.filter((book) => {
        const title = book.title.toLowerCase()
        const author = book.author.toLowerCase()
        const category = book.category.toLowerCase()
        return title.includes(input) || author.includes(input) || category.includes(input)
    })

    rows.innerHTML = ""

    if (values.length === 0) {
        const existing = document.querySelector(".notification")
        if (existing) existing.remove()

        const notification = document.createElement("div")
        notification.className = "notification"

        notification.innerHTML = `
            <div class="notification-icon">✕</div>
            <div>Nenhum livro encontrado.</div>
          `

        document.body.appendChild(notification)

        setTimeout(() => {
            notification.remove()
        }, 3000)

        const row = document.createElement("tr")
        row.innerHTML = `
              <td colspan="4" style="text-align: center;">Nenhum livro encontrado</td>
          `
        rows.appendChild(row)
        return
    }

    values.forEach((book) => {
        const row = document.createElement("tr")
        row.innerHTML = `
              <td>${book.title}</td>
              <td>${book.author}</td>
              <td>${book.category}</td>
              <td class="actions">
                  <img src="../../assets/icons/pen.png" alt="Editar" class="edit-btn">
                  <img src="../../assets/icons/bin.png" alt="Remover" class="delete-btn">
              </td>
          `

        row.querySelector(".edit-btn").addEventListener("click", () => {
            openEditModal(book)
        })
        row.querySelector(".delete-btn").addEventListener("click", () => {
            removeBook(book.title, book.author)
        })

        rows.appendChild(row)
    })
}

var oldBook = {
    title: "",
    author: "",
    category: "",
}

function openEditModal(book) {
    oldBook = book

    document.getElementById("edit-title").value = book.title
    document.getElementById("edit-author").value = book.author
    document.getElementById("edit-category").value = book.category

    const selected = document.querySelector("#edit-category-select .selected")
    selected.textContent = book.category
    document.querySelector("#edit-category-select").classList.add("selected")

    const modal = document.getElementById("edit-book-modal")
    modal.style.display = "flex"

    setTimeout(() => {
        document.querySelector(".modal-container").classList.add("active")
    }, 10)

    setTimeout(() => {
        document.getElementById("edit-title").focus()
    }, 300)
}

function closeEditModal() {
    const modalContainer = document.querySelector(".modal-container")
    modalContainer.classList.add("closing")
    oldBook = {
        title: "",
        author: "",
        category: "",
    }

    setTimeout(() => {
        document.getElementById("edit-book-modal").style.display = "none"
        modalContainer.classList.remove("closing")
        modalContainer.classList.remove("active")
    }, 200)
}

// Atualizar a função de envio do formulário de edição para usar a nova notificação
document.getElementById("edit-book-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const newBook = {
        title: document.getElementById("edit-title").value,
        author: document.getElementById("edit-author").value,
        category: document.getElementById("edit-category").value,
    }

    if (!newBook.title || !newBook.author || !newBook.category) {
        showNotification("Campos obrigatórios", "Todos os campos são obrigatórios.", "error")
        return
    }

    await window.electron.updateBook(oldBook, newBook)
    oldBook = {
        title: "",
        author: "",
        category: "",
    }
    closeEditModal()
    loadBooks()

    showNotification("Livro atualizado", `O livro "${newBook.title}" foi atualizado com sucesso.`, "success")
})

// Substituir a função showNotification existente com esta versão melhorada
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

document.querySelectorAll(".custom-select").forEach((select) => {
    const selected = select.querySelector(".selected")
    const options = select.querySelector(".options")
    const hiddenInput = select.querySelector("input[type='hidden']")

    selected.addEventListener("click", () => {
        select.classList.toggle("open")
    })

    options.querySelectorAll("li").forEach((option) => {
        option.addEventListener("click", () => {
            selected.textContent = option.textContent
            hiddenInput.value = option.getAttribute("data-value")
            select.classList.remove("open")
        })
    })

    document.addEventListener("click", (e) => {
        if (!select.contains(e.target)) {
            select.classList.remove("open")
        }
    })
})

function initializeCustomSelects() {
    const customSelects = document.querySelectorAll(".custom-select")

    customSelects.forEach((customSelect) => {
        const selected = customSelect.querySelector(".selected")
        const options = customSelect.querySelector(".options")
        const inputHidden = customSelect.querySelector("input[type=hidden]")

        selected.addEventListener("click", () => {
            customSelect.classList.toggle("open")
        })

        options.querySelectorAll("li").forEach((option) => {
            option.addEventListener("click", () => {
                selected.textContent = option.textContent
                inputHidden.value = option.getAttribute("data-value")
                customSelect.classList.add("selected")
                customSelect.classList.remove("open")
            })
        })
    })

    document.addEventListener("click", (e) => {
        customSelects.forEach((customSelect) => {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove("open")
            }
        })
    })
}

document.getElementById("search-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        search()
    }
})

loadBooks()
