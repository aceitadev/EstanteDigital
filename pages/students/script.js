async function loadStudents() {
    const table = document.getElementById("tbody")
    const students = await window.electron.getStudents()

    table.innerHTML = ""

    if (students.length === 0) {
        const row = document.createElement("tr")
        row.innerHTML = `
              <td colspan="7" style="text-align: center;">Nenhum estudante encontrado</td>
          `
        table.appendChild(row)
        return
    }

    students.forEach((student) => {
        const row = document.createElement("tr")

        row.innerHTML = `
              <td>${student.full_name}</td>
              <td>${student.class_id}</td>
              <td>${student.email}</td>
              <td>${student.phone}</td>
              <td>${calculateAge(student.birthday)} anos</td>
              <td>${formatDateTime(student.created_at)}</td>
              <td class="actions">
                  <img src="../../assets/icons/pen.png" alt="Editar" class="edit-btn">
                  <img src="../../assets/icons/bin.png" alt="Remover" class="delete-btn">
              </td>
          `

        row.querySelector(".edit-btn").addEventListener("click", () => {
            openEditModal(student)
        })
        row.querySelector(".delete-btn").addEventListener("click", () => {
            removeStudent(student)
        })

        table.appendChild(row)
    })
}

function calculateAge(dateString) {
    const today = new Date()
    const birthDate = new Date(dateString)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }

    return age
}

function formatDateTime(dateString) {
    const date = new Date(dateString)
    const dia = String(date.getDate()).padStart(2, "0")
    const mes = String(date.getMonth() + 1).padStart(2, "0")
    const ano = date.getFullYear()
    const hora = String(date.getHours()).padStart(2, "0")
    const minuto = String(date.getMinutes()).padStart(2, "0")
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`
}

// Modificar a função removeStudent para adicionar confirmação
function removeStudent(student) {
    if (!confirm(`Tem certeza que deseja remover o estudante "${student.full_name}"?`)) return

    window.electron.removeStudent(student.full_name, student.class_id, student.email, student.phone, student.birthday)
    showNotification("Estudante removido", `O estudante "${student.full_name}" foi removido com sucesso.`, "success")
    loadStudents()
}

async function search() {
    const input = document.getElementById("search-input").value.toLowerCase()
    const rows = document.getElementById("tbody")

    const students = await window.electron.getStudents()

    const values = students.filter((student) => {
        const full_name = student.full_name.toLowerCase()
        const class_id = student.class_id.toLowerCase()
        const email = student.email.toLowerCase()
        const phone = student.phone.toLowerCase()
        return full_name.includes(input) || class_id.includes(input) || email.includes(input) || phone.includes(input)
    })

    rows.innerHTML = ""

    if (values.length === 0) {
        const existing = document.querySelector(".notification")
        if (existing) existing.remove()

        const notification = document.createElement("div")
        notification.className = "notification"

        notification.innerHTML = `
            <div class="notification-icon">✕</div>
            <div>Nenhum estudante encontrado.</div>
          `

        document.body.appendChild(notification)

        setTimeout(() => {
            notification.remove()
        }, 3000)

        const row = document.createElement("tr")
        row.innerHTML = `
              <td colspan="7" style="text-align: center;">Nenhum estudante encontrado.</td>
          `
        rows.appendChild(row)
        return
    }

    values.forEach((student) => {
        const row = document.createElement("tr")
        row.innerHTML = `
          <td>${student.full_name}</td>
          <td>${student.class_id}</td>
          <td>${student.email}</td>
          <td>${student.phone}</td>
          <td>${calculateAge(student.birthday)} anos</td>
          <td>${formatDateTime(student.created_at)}</td>
          <td class="actions">
              <img src="../../assets/icons/pen.png" alt="Editar" class="edit-btn">
              <img src="../../assets/icons/bin.png" alt="Remover" class="delete-btn">
          </td>
      `

        row.querySelector(".edit-btn").addEventListener("click", () => {
            openEditModal(student)
        })
        row.querySelector(".delete-btn").addEventListener("click", () => {
            removeStudent(student)
        })

        rows.appendChild(row)
    })
}

var oldStudent = {
    full_name: "",
    class_id: "",
    email: "",
    phone: "",
    birthday: "",
}

function openEditModal(student) {
    oldStudent = student

    document.getElementById("edit-full_name").value = student.full_name
    document.getElementById("edit-class_id").value = student.class_id
    document.getElementById("edit-email").value = student.email
    document.getElementById("edit-phone").value = student.phone
    document.getElementById("edit-birthday").value = student.birthday

    const modal = document.getElementById("edit-student-modal")
    modal.style.display = "flex"

    setTimeout(() => {
        document.querySelector(".modal-container").classList.add("active")
    }, 10)

    setTimeout(() => {
        document.getElementById("edit-full_name").focus()
    }, 300)
}

function closeEditModal() {
    const modalContainer = document.querySelector(".modal-container")
    modalContainer.classList.add("closing")

    oldStudent = {
        full_name: "",
        class_id: "",
        email: "",
        phone: "",
        birthday: "",
    }

    setTimeout(() => {
        document.getElementById("edit-student-modal").style.display = "none"
        modalContainer.classList.remove("closing")
        modalContainer.classList.remove("active")
    }, 200)
}

// Atualizar a função de envio do formulário de edição para usar a nova notificação
document.getElementById("edit-student-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const newStudent = {
        full_name: document.getElementById("edit-full_name").value,
        class_id: document.getElementById("edit-class_id").value,
        email: document.getElementById("edit-email").value,
        phone: document.getElementById("edit-phone").value,
        birthday: document.getElementById("edit-birthday").value,
    }

    // Verificação básica
    if (!newStudent.full_name || !newStudent.class_id) {
        showNotification("Campos obrigatórios", "Nome completo e turma são obrigatórios.", "error")
        return
    }

    await window.electron.updateStudent(oldStudent, newStudent)

    oldStudent = {
        full_name: "",
        class_id: "",
        email: "",
        phone: "",
        birthday: "",
    }

    closeEditModal()
    loadStudents()

    showNotification(
        "Estudante atualizado",
        `O estudante "${newStudent.full_name}" foi atualizado com sucesso.`,
        "success",
    )
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

loadStudents()
