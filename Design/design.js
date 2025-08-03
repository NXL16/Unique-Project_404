class CanvasController {
    constructor() {
        // DOM elements
        this.grid = document.getElementById('canvas-grid');
        this.area = document.querySelector('.canvas-area');
        this.toggleBtn = document.getElementById('toggle-3d');
        this.coordinatesDisplay = document.getElementById('coordinates');
        this.draggableObjects = document.querySelectorAll('.draggable-object');

        // State
        this.isPanning = false;
        this.isRotating = false;
        this.isDraggingObject = false;
        this.draggedObject = null;
        this.startX = 0;
        this.startY = 0;
        this.panX = 0;
        this.panY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.gridSize = 40; // px
        this.minGrid = 10;
        this.maxGrid = 120;
        this.is3D = false;
        this.rotateX = 0; // Góc nghiêng trục X
        this.rotateZ = 0; // Góc xoay trục Z
        this.maxPan = 5000; // Giới hạn pan
        this.lastWheelTime = 0;

        // Kiểm tra DOM elements
        if (!this.grid || !this.area || !this.toggleBtn) {
            console.error('One or more required DOM elements are missing');
            return;
        }

        this.init();
    }

    init() {
        this.resizeGrid();
        this.bindEvents();
        this.updateGridTransform();
    }

    // Điều chỉnh kích thước lưới
    resizeGrid() {
        this.grid.style.width = `${this.maxPan * 2}px`;
        this.grid.style.height = `${this.maxPan * 2}px`;
    }

    // Giới hạn pan để giữ lưới trong viewport
    constrainPan() {
        const rect = this.area.getBoundingClientRect();
        const viewportWidth = rect.width;
        const viewportHeight = rect.height;
        const gridWidth = this.gridSize * (this.maxPan * 2 / this.gridSize);
        const gridHeight = this.gridSize * (this.maxPan * 2 / this.gridSize);

        // Tính giới hạn pan dựa trên kích thước viewport và mức zoom
        const maxPanX = (gridWidth - viewportWidth) / 2 / (this.gridSize / 40);
        const maxPanY = (gridHeight - viewportHeight) / 2 / (this.gridSize / 40);

        this.panX = Math.max(-maxPanX, Math.min(maxPanX, this.panX));
        this.panY = Math.max(-maxPanY, Math.min(maxPanY, this.panY));
    }

    // Hiển thị tọa độ tâm lưới
    updateCoordinatesDisplay() {
        if (this.coordinatesDisplay) {
            // Tọa độ trong không gian lưới (ô lưới)
            const gridX = -this.panX / this.gridSize;
            const gridY = -this.panY / this.gridSize;
            // Tọa độ pixel
            const pixelX = -this.panX;
            const pixelY = -this.panY;
            this.coordinatesDisplay.textContent = 
                `Tọa độ: (${gridX.toFixed(1)}, ${gridY.toFixed(1)}) | Pixel: (${pixelX.toFixed(0)}, ${pixelY.toFixed(0)})`;
        }
    }

    // Cập nhật transform cho lưới
    updateGridTransform() {
        // Giới hạn góc xoay
        this.rotateX = Math.max(0, Math.min(90, this.rotateX));

        // Giới hạn pan
        this.constrainPan();

        // Tăng độ tương phản lưới khi zoom to
        if (this.gridSize > 80) {
            this.grid.classList.add('zoomed');
        } else {
            this.grid.classList.remove('zoomed');
        }

        if (this.is3D) {
            this.grid.style.transform =
                `translate(-50%, -50%) rotateX(${this.rotateX}deg) rotateZ(${this.rotateZ}deg) scale(1) translate3d(${this.panX}px, ${this.panY}px, 0)`;
        } else {
            this.grid.style.transform =
                `translate(-50%, -50%) rotateX(0deg) rotateZ(0deg) scale(1) translate3d(${this.panX}px, ${this.panY}px, 0)`;
        }
        this.grid.style.backgroundSize = `${this.gridSize}px ${this.gridSize}px`;

        // Cập nhật tọa độ
        this.updateCoordinatesDisplay();

        // Cập nhật vị trí các đối tượng kéo thả
        this.updateDraggableObjects();
    }

    // Cập nhật vị trí đối tượng kéo thả
    updateDraggableObjects() {
        this.draggableObjects.forEach(obj => {
            const x = parseFloat(obj.dataset.x || 0);
            const y = parseFloat(obj.dataset.y || 0);
            obj.style.transform = `translate(${x * this.gridSize + this.panX}px, ${y * this.gridSize + this.panY}px)`;
        });
    }

    // Reset trạng thái lưới
    resetGrid() {
        this.panX = 0;
        this.panY = 0;
        this.gridSize = 40;
        this.rotateX = this.is3D ? 60 : 0;
        this.rotateZ = 0;
        this.updateGridTransform();
    }

    // Xử lý các sự kiện
    bindEvents() {
        // Resize window
        window.addEventListener('resize', () => {
            this.resizeGrid();
            this.updateGridTransform();
        });

        // Chuột
        this.grid.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('draggable-object')) {
                this.isDraggingObject = true;
                this.draggedObject = e.target;
                this.startX = e.clientX - parseFloat(this.draggedObject.dataset.x || 0) * this.gridSize;
                this.startY = e.clientY - parseFloat(this.draggedObject.dataset.y || 0) * this.gridSize;
                this.draggedObject.style.cursor = 'grabbing';
                return;
            }
            if (this.is3D && e.button === 0) { // Chuột trái xoay
                this.isRotating = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.grid.style.cursor = 'grabbing';
            } else if (e.button === 2) { // Chuột phải pan
                this.isPanning = true;
                this.startX = e.clientX - this.panX;
                this.startY = e.clientY - this.panY;
                this.grid.style.cursor = 'move';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDraggingObject && this.draggedObject) {
                const x = (e.clientX - this.startX) / this.gridSize;
                const y = (e.clientY - this.startY) / this.gridSize;
                this.draggedObject.dataset.x = x.toFixed(2);
                this.draggedObject.dataset.y = y.toFixed(2);
                this.updateDraggableObjects();
            } else if (this.isRotating && this.is3D) {
                this.rotateZ += (e.clientX - this.lastMouseX) * 0.3;
                this.rotateX -= (e.clientY - this.lastMouseY) * 0.3;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.updateGridTransform();
            } else if (this.isPanning) {
                this.panX = e.clientX - this.startX;
                this.panY = e.clientY - this.startY;
                this.updateGridTransform();
            }
        });

        document.addEventListener('mouseup', () => {
            this.isPanning = false;
            this.isRotating = false;
            this.isDraggingObject = false;
            this.draggedObject = null;
            this.grid.style.cursor = 'grab';
            if (this.draggedObject) {
                this.draggedObject.style.cursor = 'move';
            }
        });

        this.grid.addEventListener('contextmenu', (e) => e.preventDefault());

        // Zoom bằng wheel
        this.grid.addEventListener('wheel', (e) => {
            e.preventDefault();
            const now = Date.now();
            if (now - this.lastWheelTime < 50) return; // Debounce
            this.lastWheelTime = now;

            const rect = this.grid.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX - centerX - this.panX;
            const mouseY = e.clientY - centerY - this.panY;
            const prevGridSize = this.gridSize;

            // Zoom mượt với hệ số tỷ lệ
            const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9; // Tăng/giảm 10%
            this.gridSize = Math.min(this.maxGrid, Math.max(this.minGrid, this.gridSize * zoomFactor));

            const scale = this.gridSize / prevGridSize;
            this.panX = Math.round(this.panX - mouseX * (scale - 1));
            this.panY = Math.round(this.panY - mouseY * (scale - 1));

            this.updateGridTransform();
        }, { passive: false });

        // Chuyển đổi 2D/3D
        this.toggleBtn.addEventListener('click', () => {
            this.is3D = !this.is3D;
            this.rotateX = this.is3D ? 60 : 0;
            this.rotateZ = 0;
            this.updateGridTransform();
        });

        // Phím tắt reset
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r') {
                this.resetGrid();
            }
        });

        // Hiện/ẩn category-sidebar khi bấm "Sơ đồ mặt bằng"
        document.querySelectorAll('.sidebar-btn').forEach((btn, idx) => {
            btn.addEventListener('click', function() {
                const categorySidebar = document.getElementById('categorySidebar');
                if (idx === 0) { // Nút "Sơ đồ mặt bằng" là nút đầu tiên
                    categorySidebar.style.display = 'block';
                } else {
                    categorySidebar.style.display = 'none';
                }
            });
        });

        // Ẩn category-sidebar khi bấm nút mũi tên thu gọn
        const collapseBtn = document.getElementById('collapseCategorySidebar');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', function() {
                document.getElementById('categorySidebar').style.display = 'none';
            });
        }
    }
}

// Khởi tạo
new CanvasController();


