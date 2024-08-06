async function loadDocuments() {
    try {
        const response = await fetch('server/public/files.json');
        const documents = await response.json();

        const documentsList = document.getElementById('documentsList');
        documentsList.innerHTML = '';

        documents.forEach((doc, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td class="py-2 px-4 text-zinc-300 border border-zinc-500">${index + 1}</td>
            <td class="py-2 px-4 text-zinc-300 border border-zinc-500">${doc.name}</td>
            <td class="py-2 px-4 text-zinc-300 border border-zinc-500">${doc.size}</td>
            <td class="py-2 px-4 text-zinc-300 border border-zinc-500 text-center">
                <button onclick="previewDocument('${doc.name}')" class="text-blue-500 hover:text-blue-700">
                    <svg class="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-width="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/>
                        <path stroke="currentColor" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    </svg>
                </button>
            </td>
            <td class="ps-10 border text-center border-zinc-500">
                <a href="server/uploads/${doc.name}" download class="text-green-500 hover:text-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v4h16v-4m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                </a>
            </td>
        `;
            documentsList.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

function previewDocument(name) {
    const previewPopup = document.getElementById('previewPopup');
    const documentPreview = document.getElementById('documentPreview');
    const downloadLink = document.getElementById('downloadLink');

    documentPreview.src = `server/uploads/${name}`;
    downloadLink.href = `server/uploads/${name}`;
    previewPopup.classList.remove('hidden');
}

function closePreview() {
    const previewPopup = document.getElementById('previewPopup');
    previewPopup.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', loadDocuments);

const correctPassword = "msc";

function handleLogin(event) {
    event.preventDefault();
    const inputPassword = document.getElementById("password").value;

    if (inputPassword === correctPassword) {
        document.getElementById("loginForm").classList.add("hidden");
        document.getElementById("mainContent").classList.remove("hidden");
    } else {
        document.getElementById("error").classList.remove("hidden");
    }
}

function checkPassword() {
    const inputPassword = document.getElementById("password").value;

    if (inputPassword === correctPassword) {
        document.getElementById("loginForm").classList.add("hidden");
        document.getElementById("mainContent").classList.remove("hidden");
    } else {
        document.getElementById("error").classList.remove("hidden");
    }
}

// Disable right-click
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

// Disable drag and drop
document.addEventListener('dragstart', function (event) {
    event.preventDefault();
});

document.addEventListener('drop', function (event) {
    event.preventDefault();
});
