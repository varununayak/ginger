let scene, camera, renderer;

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

    camera.position.z = 5;
}

function createRobotModel(robotData) {
    robotData.links.forEach(link => {
        if (link.visual) {
            const geometry = new THREE.BoxGeometry(link.visual[0], link.visual[1], link.visual[2]);
            const material = new THREE.MeshPhongMaterial({color: 0x00ff00});
            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = link.name;
            scene.add(mesh);
        }
    });

    // TODO: Handle joints and position links correctly
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('urdf', file);
    
    try {
        const response = await fetch('/parse_urdf', {
            method: 'POST',
            body: formData
        });
        const robotData = await response.json();
        
        if (!scene) {
            initScene();
            animate();
        } else {
            // Clear existing model
            while(scene.children.length > 0){ 
                scene.remove(scene.children[0]); 
            }
        }
        
        createRobotModel(robotData);
    } catch (error) {
        console.error('Error processing URDF:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('urdfInput').addEventListener('change', handleFileUpload);
});