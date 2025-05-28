async function loadValues() {
    const student = document.getElementById("stats-students");
    const books = document.getElementById("stats-books");
    const leans = document.getElementById("stats-leans");

    const allBooks = await window.electron.getBooks();
    const allStudents = await window.electron.getStudents();

    const students_amount = allStudents.length;
    const books_amount = allBooks.length;
    const leans_amount = 0;

    student.innerHTML = students_amount;
    books.innerHTML = books_amount;
    leans.innerHTML = leans_amount;
}

loadValues();