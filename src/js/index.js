import WebGL from 'three/addons/capabilities/WebGL.js';
import { initThreeJS } from './three';
import { initGUI } from './gui';

if ( WebGL.isWebGL2Available() ) {
  initGUI();
  initThreeJS();
} else {
  const WARNING = WebGL.getWebGL2ErrorMessage();
  document.body.appendChild( WARNING );
}