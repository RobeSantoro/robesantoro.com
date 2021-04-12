import * as THREE from './build/three.module.js';
import Stats from './libs/stats.module.js';
/* import { GUI } from './libs/dat.gui.module.js'; */

let container, stats;
let camera, scene, renderer;

let mesh;
let INTERSECTED;
let hemiLight, bulbLight, bulbMat;

/// RAYCASTER \\\

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(1, 1);

const color = new THREE.Color();

init();
animate();

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  /// APPENDCHILD \\\
  document.body.appendChild(renderer.domElement);

  /// SCENE \\\
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  /// LIGHTS \\\

  bulbLight = new THREE.PointLight(0xffee88, 1, 100, 2);
  const bulbGeometry = new THREE.SphereGeometry(0.2, 16, 8);

  bulbMat = new THREE.MeshStandardMaterial({
    emissive: 0xffffee,
    emissiveIntensity: 1,
    color: 0x000000
  });

  bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
  bulbLight.position.set(5, 2, 5);
  bulbLight.castShadow = true;
  scene.add(bulbLight);

  //hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02);
  //scene.add(hemiLight);

  /// CAMERA \\\
  camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 40, 60);
  camera.lookAt(0, 0, 0);

  /// INSTANCES \\\

  let i = 0;

  const x_repeat = 20;
  const y_repeat = 40;
  const count = x_repeat * y_repeat;

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({
    color: 'rgb(240, 240, 240)',
    envMap: ''
  });

  mesh = new THREE.InstancedMesh(geometry, material, count);

  const matrix = new THREE.Matrix4();

  for (let y = -10; y < y_repeat; y++) {

    for (let x = -16; x < x_repeat; x++) {

      matrix.setPosition(x, y, x + -y);

      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, color);

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      i++;
    }
  }
  mesh.rotation.set(0, Math.PI / 4, 0);
  scene.add(mesh);

  /// STATS \\\

  stats = new Stats();
  container.appendChild(stats.dom);

  const width = window.innerWidth;
  const height = window.innerHeight;

  /// GRID \\\
  /*
  const size = 20;
  const divisions = 20;

  const gridHelper = new THREE.GridHelper(size, divisions);
  scene.add(gridHelper);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
  */

  /// EVENT LISTENER \\\
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('touchmove', onTouchMove, { passive: false });

  //document.addEventListener( 'click', onClick);
  document.addEventListener('mousedown', onMouseDown);



}

function onWindowResize() {

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);

}

function onMouseMove(event) {
  event.preventDefault();

  // get normalized mouse coordinates for raycaster
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  var bulbPosition = new THREE.Vector3(mouse.x * 10, mouse.y * 6 + 3, -mouse.y * 5 + 5);

  if (mesh) {
    bulbLight.position.set(bulbPosition.x, bulbPosition.y, bulbPosition.z);
  }

  renderer.toneMappingExposure = Math.pow(2, 5.0); // to allow for very bright scenes.
  renderer.shadowMap.enabled = true;
  bulbLight.castShadow = true;

}

function onTouchMove(event) {
  event.preventDefault();

  // get normalized mouse coordinates for raycaster
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  var bulbPosition = new THREE.Vector3(mouse.x * 10, mouse.y * 6 + 3, -mouse.y * 5 + 5);

  if (mesh) {
    bulbLight.position.set(bulbPosition.x, bulbPosition.y, bulbPosition.z);
  }

  renderer.toneMappingExposure = Math.pow(2, 5.0); // to allow for very bright scenes.
  renderer.shadowMap.enabled = true;
  bulbLight.castShadow = true;

}

function onMouseDown(event) {
  event.preventDefault();

  // get normalized mouse coordinates for raycaster
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  /// RAYCASTING \\\
  raycaster.setFromCamera(mouse, camera);

  const intersection = raycaster.intersectObject(mesh);

  if (intersection.length > 0) {

    const instanceId = intersection[0].instanceId;

    if (INTERSECTED != intersection[0].instanceId) {

      mesh.setColorAt(instanceId, color.setHex(Math.random() * 0xffffff));
      mesh.instanceColor.needsUpdate = true;

    }
  }

}

function animate() {

  stats.begin();
  render();
  stats.end();

  requestAnimationFrame(animate);
}

function render() {
  const timer = performance.now();
  renderer.render(scene, camera);
}
