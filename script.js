const Classes = {
    0: 'Actinic Keratoses',
    1: 'Basal Cell Carcinoma',
    2: 'Benign lesions of the keratosis',
    3: 'Dermatofibroma',
    4: 'Melanoma',
    5: 'Melanocytic nevi',
    6: 'Vascular lesions',
};

async function loadModel() {
    document.getElementById('model-status').textContent = 'Model Loading...';
    document.getElementById('loading-indicator').classList.remove('hidden');
    const model = await tf.loadLayersModel('json_model/model.json');
    console.log('Model loaded');
    document.getElementById('model-status').textContent = 'Model Loaded';
    document.getElementById('loading-indicator').classList.add('hidden');
    return model;
}

async function classifyImage(model, imgElement) {
    const image = tf.browser.fromPixels(imgElement);
    const resizedImage = tf.image.resizeBilinear(image, [224, 224]);
    const batchedImage = resizedImage.expandDims(0);
    const preprocessedImage = tf.tidy(() => {
        return batchedImage.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1));
    });

    const predictions = model.predict(preprocessedImage);
    const predictionArray = await predictions.array();
    displayPredictions(predictionArray);
}

function displayPredictions(predictionArray) {
    const predictionList = document.getElementById('prediction-list');
    predictionList.innerHTML = ''; // Clear previous predictions

    predictionArray[0].forEach((prediction, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'text-lg';

        const percentage = (prediction * 100).toFixed(2);
        listItem.innerHTML = `${Classes[index]}: ${percentage}%`;

        const bar = document.createElement('div');
        bar.className = 'w-full bg-gray-700 rounded-full mt-2 overflow-hidden';
        const barFill = document.createElement('div');
        barFill.className = 'bg-blue-600 h-2 rounded-full';
        barFill.style.width = `0%`; // Start with zero width

        // Animate the bar fill width
        setTimeout(() => {
            barFill.style.width = `${percentage}%`;
        }, 100);

        bar.appendChild(barFill);

        listItem.appendChild(bar);
        predictionList.appendChild(listItem);
    });
}

// File selection (from input or drag-and-drop)
function handleImage(file) {
    const reader = new FileReader();
    reader.onload = async () => {
        const imgElement = document.getElementById('selected-image');
        imgElement.src = reader.result;
        imgElement.onload = async () => {
            const model = await loadModel();
            classifyImage(model, imgElement);
        };
    };
    reader.readAsDataURL(file);
}

// Drag and drop functionality
let dropArea = document.getElementById('drop-area');
let imageSelector = document.getElementById('image-selector');

// Prevent default behaviors for drag events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area on drag
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('border-teal-400'));
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('border-teal-400'));
});

// Handle drop
dropArea.addEventListener('drop', (e) => {
    let dt = e.dataTransfer;
    let files = dt.files;
    if (files.length > 0) {
        handleImage(files[0]);
    }
});

// Handle file selection through button click
imageSelector.addEventListener('change', async event => {
    const file = event.target.files[0];
    if (file) {
        handleImage(file);
    }
});

// Load the model when the page loads
window.onload = async () => {
    await loadModel();
};

// Popup window handling for Model button
document.getElementById('model-button').addEventListener('click', () => {
    document.getElementById('popup-modal').classList.remove('hidden');
});

document.getElementById('close-popup').addEventListener('click', () => {
    document.getElementById('popup-modal').classList.add('hidden');
});

// Popup window handling for Contact button
document.getElementById('contact-button').addEventListener('click', () => {
    document.getElementById('contact-popup').classList.remove('hidden');
});

document.getElementById('close-contact-popup').addEventListener('click', () => {
    document.getElementById('contact-popup').classList.add('hidden');
});

// Prevent default behavior for right-click and certain key combos
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function (e) {
    if (e.keyCode == 123) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
};

// Prevent default drag behavior outside drop area
window.ondragstart = function () { return false; };
