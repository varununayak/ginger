let scene, camera, renderer, controls;

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('viewer').appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(directionalLight);

    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    // Add OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add grid
    const gridHelper = new THREE.GridHelper(10, 100, 0x888888, 0x444444);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

async function handleFileUpload(event) {
    const file = event.target.files[0];

    try {
        const loader = new THREE.OBJLoader();
        const objData = await file.text();
        const object = loader.parse(objData);

        // Clear existing model
        scene.children.forEach(child => {
            if (child.type === 'Group') {
                scene.remove(child);
            }
        });

        scene.add(object);

        // Center the object
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);

        // Scale the object to fit in the scene
        const scaleVector = new THREE.Vector3();
        box.getSize(scaleVector);
        const maxDim = Math.max(scaleVector.x, scaleVector.y, scaleVector.z);
        const scale = 5 / maxDim;
        object.scale.set(scale, scale, scale);

    } catch (error) {
        console.error('Error processing 3D model:', error);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener('DOMContentLoaded', () => {
    initScene();
    animate();
    document.getElementById('modelInput').addEventListener('change', handleFileUpload);
    window.addEventListener('resize', onWindowResize);
});