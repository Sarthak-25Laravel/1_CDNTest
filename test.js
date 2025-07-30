// imageReducer.js
window.ImageReducer = (function () {
    let config = {};
    let containerRef = null;

    function init(selector, options = {}) {
        config = { ...options };
        const container = document.querySelector(selector);
        if (!container) {
            console.error('ImageReducer: Container not found');
            return;
        }
        containerRef = container;

        container.innerHTML = `
        
        <div class="upload-wrapper">
            <div class="drop-area" id="dropArea">
                <p>Drag & drop image here or click to select</p>
                <input type="file" id="fileInput" accept="image/*" hidden>
                <button id="selectFileBtn">Choose File</button>
                <div id="errorMsg"></div>
                <div id="successMsg"></div>
            </div>
            <div id="preview"></div>
            <label>DPI: <input type="range" id="dpiRange" min="50" max="300" value="300"></label>
            <span id="dpiValue">300</span>
            <button id="convertBtn">Convert to WebP</button>

            <div id="previewModal" class="modal">
                <div class="modal-content">
                    <button class="close-btn" id="closePreview">×</button>
                    <div class="image-comparison">
                        <div>
                            <h3>Original</h3>
                            <img id="originalPreviewImg">
                            <div id="originalMeta"></div>
                        </div>
                        <div>
                            <h3>Converted (WebP)</h3>
                            <img id="webpPreviewImg">
                            <div id="webpMeta"></div>
                        </div>
                    </div>
                    <button id="downloadWebpBtn">Download WebP</button>
                </div>
            </div>
        </div>
        `;

        attachEvents(container);
    }

    function attachEvents(container) {
        const dropArea = container.querySelector('#dropArea');
        const fileInput = container.querySelector('#fileInput');
        const selectFileBtn = container.querySelector('#selectFileBtn');
        const dpiRange = container.querySelector('#dpiRange');
        const dpiValue = container.querySelector('#dpiValue');
        const convertBtn = container.querySelector('#convertBtn');
        const previewModal = container.querySelector('#previewModal');
        const closePreview = container.querySelector('#closePreview');
        const downloadBtn = container.querySelector('#downloadWebpBtn');

        const originalImg = container.querySelector('#originalPreviewImg');
        const webpImg = container.querySelector('#webpPreviewImg');
        const originalMeta = container.querySelector('#originalMeta');
        const webpMeta = container.querySelector('#webpMeta');

        let selectedFile = null;
        let webpDataUrl = null;

        selectFileBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            selectedFile = e.target.files[0];
            showPreview(selectedFile);
        });

        dpiRange.addEventListener('input', () => {
            dpiValue.textContent = dpiRange.value;
        });

        dropArea.addEventListener('dragover', e => {
            e.preventDefault();
            dropArea.classList.add('highlight');
        });
        dropArea.addEventListener('dragleave', () => {
            dropArea.classList.remove('highlight');
        });
        dropArea.addEventListener('drop', e => {
            e.preventDefault();
            dropArea.classList.remove('highlight');
            selectedFile = e.dataTransfer.files[0];
            showPreview(selectedFile);
        });

        convertBtn.addEventListener('click', () => {
            if (!selectedFile) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    const dpi = parseInt(dpiRange.value);
                    const scale = dpi / 300;

                    const canvas = document.createElement('canvas');
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob(blob => {
                        webpDataUrl = URL.createObjectURL(blob);
                        webpImg.src = webpDataUrl;
                        webpMeta.innerHTML = `Size: ${(blob.size / 1024).toFixed(2)} KB`;

                        previewModal.style.display = 'block';
                    }, 'image/webp', 0.9);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(selectedFile);
        });

        closePreview.addEventListener('click', () => {
            previewModal.style.display = 'none';
        });

        downloadBtn.addEventListener('click', () => {
            if (webpDataUrl) {
                const a = document.createElement('a');
                a.href = webpDataUrl;
                a.download = 'converted.webp';
                a.click();
            }
        });

        function showPreview(file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                originalImg.src = e.target.result;
                originalMeta.innerHTML = `Size: ${(file.size / 1024).toFixed(2)} KB`;
            };
            reader.readAsDataURL(file);
        }
    }

    return { init };
})();
