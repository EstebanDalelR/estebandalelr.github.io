// Auto-generated content.
// This file contains the boilerplate to set up your React app.
// If you want to modify your application, start in "index.vr.js"

// Auto-generated content.
import {VRInstance} from 'react-vr-web';
import * as OVRUI from 'ovrui';
import ControllerRayCaster from 'react-vr-controller-raycaster';

const THREE = require('three');

function init(bundle, parent, options) {
    const scene = new THREE.Scene();
    const vr = new VRInstance(bundle, 'GerisGame', parent, {

      raycasters: [
        new ControllerRayCaster({scene, color: '#ff0000'}),
        new OVRUI.MouseRayCaster(),
      ],
  
      scene: scene,
      cursorVisibility: 'visible',
    // Add custom options here
    ...options,
  });
  vr.render = function() {
    // Any custom behavior you want to perform on each frame goes here
  };
  // Begin the animation loop
  vr.start();
  return vr;
}

window.ReactVR = {init};
