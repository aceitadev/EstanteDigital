function finish(event) {
    event.preventDefault()

    const full_name = document.getElementById("full_name").value
    const class_id = document.getElementById("class_id").value
    const email = document.getElementById("email").value
    const phone = document.getElementById("phone").value
    const birthday = document.getElementById("birthday").value

    if (!full_name || !class_id || !email || !phone || !birthday) {
        showNotification("Campos obrigatórios", "Por favor, preencha todos os campos.", "error")
        return
    }

    window.electron.setWindow("students")
    window.electron.addStudent(full_name, class_id, email, phone, birthday)
    window.electron.sendNotification("Estudante adicionado", `O estudante "${full_name}" foi adicionado com sucesso.`)
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
