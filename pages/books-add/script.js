function finish(event) {
    event.preventDefault()

    const title = document.getElementById("name").value
    const author = document.getElementById("author").value
    const category = document.querySelector(".custom-select input[type=hidden]").value

    if (!title || !author || !category) {
        showNotification("Campos obrigatórios", "Por favor, preencha todos os campos.", "error")
        return
    }

    window.electron.setWindow("books")
    window.electron.addBook(title, author, category)
    window.electron.sendNotification("Livro adicionado", `O livro "${title}" de ${author} foi adicionado com sucesso.`)
}

// Adicionar função de notificação
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

document.addEventListener("DOMContentLoaded", () => {
    const customSelect = document.querySelector(".custom-select")
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

    document.addEventListener("click", (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove("open")
        }
    })

    if (inputHidden.value) {
        customSelect.classList.add("selected")
        selected.textContent = inputHidden.value
    } else {
        customSelect.classList.remove("selected")
    }
})
