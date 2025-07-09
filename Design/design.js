// Tab switching logic for sidebar
document.querySelectorAll('.sidebar-tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.sidebar-content').forEach(c => c.style.display = 'none');
        document.getElementById('sidebar-' + this.dataset.tab).style.display = 'block';
    });
});
// 2D/3D switching logic
document.getElementById('btn-2d').onclick = function () {
    this.classList.add('active');
    document.getElementById('btn-3d').classList.remove('active');
    document.getElementById('canvas2d').style.display = 'block';
    document.getElementById('canvas3d').style.display = 'none';
};
document.getElementById('btn-3d').onclick = function () {
    this.classList.add('active');
    document.getElementById('btn-2d').classList.remove('active');
    document.getElementById('canvas2d').style.display = 'none';
    document.getElementById('canvas3d').style.display = 'block';
    if (!window._threeInitialized) {
        initThreeScene();
        window._threeInitialized = true;
    } else {
        if (window._threeRenderer && window._threeCamera) {
            resizeThreeRenderer();
        }
    }
};

// --- Vẽ lưới trên canvas2d bằng fabric.js ---
window.addEventListener('DOMContentLoaded', function () {
    var canvas2d = new fabric.Canvas('canvas2d', { selection: false });
    var gridSize = 40;
    var width = canvas2d.getWidth();
    var height = canvas2d.getHeight();
    // Vẽ lưới dọc
    for (var i = 0; i < width / gridSize; i++) {
        var line = new fabric.Line([i * gridSize, 0, i * gridSize, height], {
            stroke: '#e0e0e0', strokeWidth: 1, selectable: false, evented: false, opacity: 0.25
        });
        canvas2d.add(line);
    }
    // Vẽ lưới ngang
    for (var i = 0; i < height / gridSize; i++) {
        var line = new fabric.Line([0, i * gridSize, width, i * gridSize], {
            stroke: '#e0e0e0', strokeWidth: 1, selectable: false, evented: false, opacity: 0.25
        });
        canvas2d.add(line);
    }
    // Đảm bảo lưới luôn nằm dưới cùng
    canvas2d.sendToBack(...canvas2d.getObjects());
    window._fabricCanvas = canvas2d;
});

// --- Thêm model 3D mẫu vào canvas3d bằng three.js ---
let _threeScene, _threeCamera, _threeRenderer, _threeControls, _threeAnimateId;
function initThreeScene() {
    const container = document.getElementById('canvas3d');
    container.innerHTML = '';
    // Scene
    _threeScene = new THREE.Scene();
    _threeScene.background = new THREE.Color(0xf5f6fa);
    // Camera
    _threeCamera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    _threeCamera.position.set(5, 7, 12);
    _threeCamera.lookAt(0, 0, 0);
    // Renderer
    _threeRenderer = new THREE.WebGLRenderer({ antialias: true });
    _threeRenderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(_threeRenderer.domElement);
    // Light
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    _threeScene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(10, 20, 10);
    _threeScene.add(dirLight);
    // Lưới mặt phẳng
    const gridHelper = new THREE.GridHelper(20, 20, 0xcccccc, 0xe0e0e0);
    _threeScene.add(gridHelper);
    // Model: Bàn (hình hộp)
    const tableGeometry = new THREE.BoxGeometry(3, 0.2, 1.5);
    const tableMaterial = new THREE.MeshPhongMaterial({ color: 0xc2b280 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(0, 0.1, 0);
    _threeScene.add(table);
    // Model: Ghế (hình hộp nhỏ)
    const chairGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const chairMaterial = new THREE.MeshPhongMaterial({ color: 0x8e9eab });
    const chair1 = new THREE.Mesh(chairGeometry, chairMaterial);
    chair1.position.set(-1, 0.25, 1);
    _threeScene.add(chair1);
    const chair2 = chair1.clone();
    chair2.position.set(1, 0.25, 1);
    _threeScene.add(chair2);
    // Model: Ghế tròn (cylinder)
    const roundChairGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.45, 32);
    const roundChairMaterial = new THREE.MeshPhongMaterial({ color: 0x6c5ce7 });
    const roundChair = new THREE.Mesh(roundChairGeometry, roundChairMaterial);
    roundChair.position.set(0, 0.225, -0.8);
    _threeScene.add(roundChair);
    // Orbit Controls
    const controlsScript = document.createElement('script');
    controlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/controls/OrbitControls.min.js';
    controlsScript.onload = function () {
        _threeControls = new THREE.OrbitControls(_threeCamera, _threeRenderer.domElement);
        _threeControls.target.set(0, 0, 0);
        _threeControls.update();
        animateThree();
        window.addEventListener('resize', resizeThreeRenderer);
    };
    document.body.appendChild(controlsScript);
}
function animateThree() {
    _threeAnimateId = requestAnimationFrame(animateThree);
    if (_threeControls) _threeControls.update();
    _threeRenderer.render(_threeScene, _threeCamera);
}
function resizeThreeRenderer() {
    const container = document.getElementById('canvas3d');
    if (_threeCamera && _threeRenderer) {
        _threeCamera.aspect = container.offsetWidth / container.offsetHeight;
        _threeCamera.updateProjectionMatrix();
        _threeRenderer.setSize(container.offsetWidth, container.offsetHeight);
    }
}