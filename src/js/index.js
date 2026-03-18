import WebGL from 'three/addons/capabilities/WebGL.js';
import { ThreeApp } from './threeApp';
import { DebugGUI } from './debugGUI';
import { FPSCounter } from './fpsCounter';
import { Particles } from './particles';

const container = document.body;

if (WebGL.isWebGL2Available()) {  
  const debugGUI = new DebugGUI({container: container.canvas});
  const fpsCounter = new FPSCounter();
  let particles = new Particles();

  if(debugGUI) {
    const { type, count, posBounds, size, color, speed, wireframe } = debugGUI.object.particlesGeometry.input;
    particles = new Particles({ type: type.default, count, posBounds, size, color, speed, wireframe});
  } 

  const threeApp = new ThreeApp({debugGUI, fpsCounter});
  threeApp.createRenderer({container, width: window.innerWidth, height: window.innerHeight});
  threeApp.createCamera({aspect: window.innerWidth / window.innerHeight, enableControls: true});
  threeApp.setGeometry(particles);
  threeApp.setRunning(true);
  
  window.addEventListener("resize", (event) => {
    threeApp.updateRenderer({width: window.innerWidth, height: window.innerHeight});
    threeApp.updateCamera({aspect: window.innerWidth / window.innerHeight});
  })

  debugGUI.start({onChange: update})
  
  function update(object) {
    const { type, count, posBounds, size, color, speed, wireframe } = object.particlesGeometry.input;
    particles = new Particles({ type: type.default, count, posBounds, size, color, speed, wireframe});
    threeApp.setGeometry(particles);
  }
} else {
  const warning = WebGL.getWebGL2ErrorMessage();
  container.appendChild(warning);
}