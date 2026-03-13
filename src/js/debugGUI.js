import GUI from 'lil-gui';
import { loadFromLocalStorage, removeLocalStorage, saveToLocalStorage } from './localStorage';
import { createGeometry } from './three';

class DebugGUI {
    constructor() {
        this.gui = new GUI(document.body);
        this.loadButton;
        this.deleteButton;

        this.PARAMS = {
            performance: {
                display: {
                    fps: 0,
                    calls: 0,
                    triangles: 0,
                    JsHeapMB: 0
                }
            },

            gpuMemory: {
                display: {
                    geometries: 0,
                    textures: 0
                }
            },
            
            particlesGeometry: {
                input: {
                    type: 'points',
                    count: 100,
                    size: 0.5,
                    color: 0x00ff00,
                    posBounds: 50,
                    speed: 5,
                    wireframe: false
                }
            },
            
            presets: {
                button: {
                    savePreset: () => {
                        saveToLocalStorage( 'preset', this.gui.save() );
                        this.loadButton.enable();
                        this.deleteButton.enable();
                    },
                    loadPreset: () => {
                        this.gui.load(loadFromLocalStorage( 'preset' ));
                    },
                    deleteAllPresets: () => {
                        if (confirm( 'Do you want to delete all presets?' )) {
                            removeLocalStorage( 'preset' );
                            this.loadButton.disable();
                            this.deleteButton.disable();
                        } 
                    }
                }
            }
        }
    }

    init() {
        let { gui } = this;
        const { PARAMS } = this;
        
        let method;
        let params;

        for (let propertyName in PARAMS) {            
            const folder = gui.addFolder( propertyName );

            for (let type in PARAMS[propertyName]) {
                for (let key in PARAMS[propertyName][type]) {
                    const capitalize = key.charAt(0).toLocaleUpperCase() + key.substring(1);

                    if (key == "color") {
                        method = "addColor";
                    } else {
                        method = "add";
                    }

                    if (key == "type") {
                        params = [PARAMS[propertyName][type], key, ['points', 'cubes']];
                    } else {
                        params = [PARAMS[propertyName][type], key];
                    }
                    
                    let control = folder[method](...params).name(capitalize);
                    
                    if (type == "input") {
                        control.onChange(() => {
                            createGeometry(PARAMS[propertyName][type]);
                        });
                    }
                    
                    if (key == "loadPreset") {
                        this.loadButton = control;
                    } else if (key == "deleteAllPresets") {
                        this.deleteButton = control;
                    }
                }
            }
        }

        let preset = loadFromLocalStorage( 'preset' )

        if (preset != null) {
            this.loadButton.enable();
            this.deleteButton.enable();
            gui.load(preset);
        } else {
            this.loadButton.disable();
            this.deleteButton.disable();
        }
    }
}

export { DebugGUI }