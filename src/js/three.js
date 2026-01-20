import * as THREE from 'three';

function initThreeJS() {
    // Set the scene size
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    // Set the camera attributes
    const FOV = 75;
    const ASPECT = WIDTH / HEIGHT;
    const NEAR = 0.1;
    const FAR = 1000;

    // Set up the geometry
    const BOX_SIZE = new THREE.Vector3( 1, 1, 1);
    const BOX_COLOR = 0x00ff00;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( WIDTH, HEIGHT, true);
    renderer.setAnimationLoop ( animate );
    document.body.appendChild( renderer.domElement );

    const boxGeometry = new THREE.BoxGeometry( BOX_SIZE.x, BOX_SIZE.y, BOX_SIZE.z );
    const material = new THREE.MeshBasicMaterial( { color: BOX_COLOR } );
    const cube = new THREE.Mesh( boxGeometry, material );
    scene.add( cube );

    function animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render( scene, camera );
    }
}

export { initThreeJS }