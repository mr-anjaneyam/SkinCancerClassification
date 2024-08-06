document.addEventListener('DOMContentLoaded', () => {
    fetchDocuments();
    document.getElementById('saveJsonBtn').addEventListener('click', function() {
        console.log('Button clicked');
        fetch('/save-json')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('JSON file saved successfully');
                } else {
                    alert('Error saving JSON file: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error saving JSON file');
            });
    });
    setInterval(checkSession, 300000); // Check session every 5 minutes
});

function fetchDocuments() {
    fetch('/documents')
        .then(response => response.json())
        .then(data => {
            const documentsList = document.getElementById('documentsList');
            documentsList.innerHTML = '';
            data.forEach((doc, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="py-2 px-4 text-zinc-300 border border-zinc-500">${index + 1}</td>
                    <td class="py-2 px-4 text-zinc-300 border border-zinc-500">${doc.name}</td>
                    <td class="py-2 px-4 text-zinc-300 border border-zinc-500">${doc.size}</td>
                    <td class="py-2 px-4 text-zinc-300 border border-zinc-500 text-center">
                        <button onclick="previewDocument('${doc.name}')" class="text-blue-500 hover:text-blue-700 ">
                            <svg class="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-width="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/>
                                <path stroke="currentColor" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                            </svg>

                        </button>
                    </td>
                    <td class="ps-10 border text-center border-zinc-500">
                        <a href="/documents/${doc.name}" download class="text-green-500 hover:text-green-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v4h16v-4m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                        </a>
                    </td>
                    <td class="py-2 px-4 border text-center border-zinc-500">
                        <button onclick="deleteDocument('${doc.name}')" class="text-red-500 hover:text-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </td>
                `;
                documentsList.appendChild(row);
            });
        });
}

function uploadFiles() {
    const files = document.getElementById('uploadFiles').files;
    const fileName = document.getElementById('fileName').value;
    const formData = new FormData();
    
    for (let file of files) {
        formData.append('files', file);
    }
    formData.append('name', fileName);

    fetch('/upload', {
        method: 'POST',
        body: formData
    }).then(response => {
        if (response.ok) {
            fetchDocuments();
        } else {
            alert('File upload failed.');
        }
    });
    location.reload();
}

function previewDocument(name) {
    const previewPopup = document.getElementById('previewPopup');
    const documentPreview = document.getElementById('documentPreview');
    const downloadLink = document.getElementById('downloadLink');

    documentPreview.src = `/uploads/${name}`;
    downloadLink.href = `/uploads/${name}`;
    previewPopup.classList.remove('hidden');
}

function closePreview() {
    const previewPopup = document.getElementById('previewPopup');
    previewPopup.classList.add('hidden');
}

function showDeletePopup(name) {
    const deletePopup = document.getElementById('deletePopup');
    deletePopup.classList.remove('hidden');
    deletePopup.dataset.name = name;
}

function closeDeletePopup() {
    const deletePopup = document.getElementById('deletePopup');
    deletePopup.classList.add('hidden');
}

function deleteDocument(fileName) {
    fetch('/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('File deleted successfully');
            location.reload(); // Optional: reload to see updated list
        } else {
            alert('Error deleting file: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}


function checkSession() {
    fetch('/check-session').then(response => {
        if (!response.ok) {
            window.location.href = '/';
        }
    });
}




