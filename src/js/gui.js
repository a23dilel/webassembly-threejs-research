import GUI from 'lil-gui';
import { loadFromLocalStorage, removeLocalStorage, saveToLocalStorage } from './localStorage';

let gui; 
let loadButton;
let deleteButton;

const PARAMS = {
    // Performance
    fps: 0,
    calls: 0,
    triangles: 0,
    JsHeapMB: 0,
    
    // GPU Memory
    geometries: 0,
    textures: 0,
    
    // Particles Geometry
    type: 'points',
    count: 100,
    size: 0.5,
    color: 0x00ff00,
    posBounds: 50,
    speed: 5,
    wireframe: false,

    // Presets
    savePreset() {
        saveToLocalStorage( 'preset', gui.save() );
        loadButton.enable();
        deleteButton.enable();
    },
    loadPreset() {
        gui.load(loadFromLocalStorage( 'preset' ));
    },
    deleteAllPresets() {
        if (confirm( 'Do you want to delete all presets?' )) {
            removeLocalStorage( 'preset' );
            loadButton.disable();
            deleteButton.disable();
        } 
    }
}

function initGUI() {
    gui = new GUI(document.body);

    // Controller properties

    const PERF_FOLDER = gui.addFolder( 'Performance' );
    PERF_FOLDER.add( PARAMS, 'fps' ).listen();
    PERF_FOLDER.add( PARAMS, 'calls' ).listen();
    PERF_FOLDER.add( PARAMS, 'triangles' ).listen();
    PERF_FOLDER.add( PARAMS, 'JsHeapMB').listen();
    
    const GPU_MEMORY_FOLDER = gui.addFolder( 'GPU Memory' );
    GPU_MEMORY_FOLDER.add( PARAMS, 'geometries' ).listen().name( 'Geometries' );
    GPU_MEMORY_FOLDER.add( PARAMS, 'textures' ).listen().name( 'Textures' );
    
    const GEOMETRY_FOLDER = gui.addFolder( 'Geometry' );
    GEOMETRY_FOLDER.addColor( PARAMS, 'cubeColor' ).name( 'Cube color' );
    GEOMETRY_FOLDER.add( PARAMS, 'wireframe' );
    
    const PRESETS_FOLDER = gui.addFolder( 'Presets' );
    PRESETS_FOLDER.add( PARAMS, 'savePreset' ).name( 'Save preset' );
    loadButton = PRESETS_FOLDER.add( PARAMS, 'loadPreset' ).name( 'Load preset' );
    deleteButton = PRESETS_FOLDER.add( PARAMS, 'deleteAllPresets' ).name( 'Delete all presets' );
    
    let preset = loadFromLocalStorage( 'preset' )

    if (preset != null) {
        loadButton.enable();
        deleteButton.enable();
        gui.load(preset);
    } else {
        loadButton.disable();
        deleteButton.disable();
    }
}

export { PARAMS, initGUI }