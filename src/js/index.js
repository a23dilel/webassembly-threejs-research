import WebGL from 'three/addons/capabilities/WebGL.js';
import { initGUI } from './gui';

if ( WebGL.isWebGL2Available() ) {
  initGUI();
} else {
  const WARNING = WebGL.getWebGL2ErrorMessage();
  document.body.appendChild( WARNING );
}