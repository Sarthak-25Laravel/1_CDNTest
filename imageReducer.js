// imageReducer.js
// A self-contained, CDN-friendly image reducer tool with cropper and WebP conversion

window.ImageReducer = (function () {
    let selectedFiles = [];
    let currentCropper = null;
    let currentImageIndex = 0;
    let config = {};

    function init(selector, userConfig = {}) {
        const container = document.querySelector(selector);
        if (!container) {
            console.error('ImageReducer: Invalid selector');
            return;
        }

        config = { ...userConfig };
        container.innerHTML = getHTML();

        const dropArea = container.querySelector('#dropArea');
        const fileInput = container.querySelector('#fileInput');
        const preview = container.querySelector('#preview');
        const errorMsg = container.querySelector('#errorMsg');
        const successMsg = container.querySelector('#successMsg');
        const cropButton = container.querySelector('#cropButton');
        const previewConverted = container.querySelector('#previewConverted');
        const downloadAll = container.querySelector('#downloadAll');
        const dpiRange = container.querySelector('#dpiRange');
        const dpiValue = container.querySelector('#dpiValue');
        const previewModal = container.querySelector('#previewModal');
        const cancelpreviewBtn = container.querySelector('#cancelpreviewBtn');

        dpiRange.addEventListener('input', () => {
            dpiValue.textContent = dpiRange.value;
        });

        dropArea.addEventListener('click', () => fileInput.click());
        dropArea.addEventListener('dragover', e => {
            e.preventDefault();
            dropArea.classList.add('dragover');
        });
        dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
        dropArea.addEventListener('drop', e => {
            e.preventDefault();
            dropArea.classList.remove('dragover');
            handleFiles(e.dataTransfer.files, container);
        });

        fileInput.addEventListener('change', e => {
            handleFiles(e.target.files, container);
            fileInput.value = '';
        });

        cropButton.addEventListener('click', () => openCropper(container));

        previewConverted.addEventListener('click', () => previewWebP(container));

        cancelpreviewBtn.addEventListener('click', () => {
            previewModal.style.display = 'none';
        });

        downloadAll.addEventListener('click', () => downloadAllWebP(container));
    }

    function getHTML() {
        return `
            <div class="upload-container">
                <div class="drop-area" id="dropArea">
                    <p>Drag & Drop or Click to Upload</p>
                    <input type="file" id="fileInput" multiple accept="image/*" style="display:none">
                </div>
                <div class="preview" id="preview"></div>
                <div class="error" id="errorMsg"></div>
                <div class="success" id="successMsg"></div>
                <div class="btn-container">
                    <button type="button" id="previewConverted">Preview</button>
                    <button type="button" id="cropButton">Crop</button>
                    <div id="dpi">
                        <label>DPI:</label>
                        <input type="range" id="dpiRange" min="10" max="100" value="72">
                        <span id="dpiValue">72</span>
                    </div>
                    <button type="button" id="downloadAll">Download All</button>
                </div>
            </div>
            <div id="previewModal" style="display:none">
                <img id="originalPreviewImg">
                <img id="convertedPreviewImg">
                <div id="convertedMeta"></div>
                <a id="cancelpreviewBtn">Cancel</a>
            </div>
        `;
    }

    function handleFiles(files, container) {
        const preview = container.querySelector('#preview');
        const errorMsg = container.querySelector('#errorMsg');
        const successMsg = container.querySelector('#successMsg');

        errorMsg.textContent = '';
        successMsg.textContent = '';

        Array.from(files).forEach((file, i) => {
            selectedFiles.push(file);

            const reader = new FileReader();
            reader.onload = e => {
                const div = document.createElement('div');
                div.className = 'preview-item';

                const img = document.createElement('img');
                img.src = e.target.result;
                div.appendChild(img);

                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }

    function openCropper(container) {
        // implement crop modal here
    }

    function previewWebP(container) {
        const previewModal = container.querySelector('#previewModal');
        const originalPreviewImg = container.querySelector('#originalPreviewImg');
        const convertedPreviewImg = container.querySelector('#convertedPreviewImg');
        const convertedMeta = container.querySelector('#convertedMeta');

        if (selectedFiles.length !== 1) return;

        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                originalPreviewImg.src = img.src;

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);

                canvas.toBlob(blob => {
                    convertedPreviewImg.src = URL.createObjectURL(blob);
                    convertedMeta.innerHTML = `WEBP Size: ${(blob.size / 1024).toFixed(2)} KB`;
                    previewModal.style.display = 'block';
                }, 'image/webp');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(selectedFiles[0]);
    }

    function downloadAllWebP(container) {
        const dpiRange = container.querySelector('#dpiRange');
        const scale = parseInt(dpiRange.value) / 72;

        selectedFiles.forEach((file, i) => {
            const reader = new FileReader();
            reader.onload = e => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(blob => {
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = `reduced-${i + 1}.webp`;
                        a.click();
                    }, 'image/webp');
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    return {
        init
    };
})();
