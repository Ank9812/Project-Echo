"use strict";

import { getAudioTestString } from "./HMI-utils.js";

var markups = ["elephant.png", "monkey.png", "tiger.png"];

var statuses = [
  "endangered",
  "vulnerable",
  "near-threatened",
  "normal",
  "invasive",
];

var vocalizedLayers = []
var trueLayers = []
var animalTypes = ["mammal", "bird", "amphibian", "reptile", "predator"];

//For Demo purposes only
//This plays an awful quailty audio test string
document.addEventListener('click', function() {
  //playAudioString(getAudioTestString());  
});

export function initialiseHMI(hmiState) {
  console.log(`initialising`);

  createBasemap(hmiState);
  addWildlifeLayers(hmiState);
  addDummyMarkers(hmiState);
  addmicrophones(hmiState);
  addVocalizedLayers(hmiState);
  addTruthLayers(hmiState);
  

  //simulateData(hmiState);
}

function updateFilters(){
  
}

function playAudioString(audioDataString) {
  // Convert the binary audio data string into a typed array
  const audioData = new Uint8Array(
    atob(audioDataString)
      .split("")
      .map((char) => char.charCodeAt(0))
  );

  // Create an audio context
  const audioContext = new AudioContext();

  // Create a new audio buffer
  const numChannels = 1;
  const sampleRate = 44100;
  const bufferLength = audioData.length / 2;
  const audioBuffer = audioContext.createBuffer(
    numChannels,
    bufferLength,
    sampleRate
  );

  // Copy the binary audio data into the audio buffer
  audioBuffer.copyToChannel(new Float32Array(audioData.buffer), 0);

  // Create a new audio buffer source node and set its buffer
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;

  // Connect the source node to the destination node of the audio context
  sourceNode.connect(audioContext.destination);

  // Start playing the audio
  sourceNode.start();
}

export function updateLayers(filterState)  {
  console.log("Filter applied, updating vocalized layer visibility...");
  console.log(filterState)
  vocalizedLayers.forEach((entry) => {
    if (filterState.includes(entry.values_.animalType) && 
        filterState.includes(entry.values_.animalStatus)) {
          console.log("do something in here!");
          entry.getStyle().getImage().setOpacity(0.5);
          entry.changed()
    }
    else{
      entry.getStyle().getImage().setOpacity(0);
      entry.changed()
    }
  })

  trueLayers.forEach((entry) => {
    if (filterState.includes(entry.values_.animalType) && 
        filterState.includes(entry.values_.animalStatus)) {
          console.log("do something in here!");
          entry.getStyle().getImage().setOpacity(1);
          entry.changed()
    }
    else{
      entry.getStyle().getImage().setOpacity(0);
      entry.changed()
    }
  })

}

function addVocalizedLayers(hmiState) {
  console.log("addVocalizedLayers called.")
  console.log("voc locs", hmiState.vocalizationLocations);
  hmiState.vocalizationLocations.forEach((entry) => {
    console.log("Vocalization Found")
    var vocalization = new ol.Feature({
      geometry: new ol.geom.Point(
        ol.proj.fromLonLat([entry.locationLon,entry.locationLat])
      ),
        name: 'vocalization',
        animalType: entry.animalType,
        animalStatus: entry.animalStatus
      });
      console.log(entry.locationLon, " ", entry.locationLat)
    
    var vocIcon = new ol.style.Style({
        image: new ol.style.Icon({
          src: `./../images/${entry.animalType+entry.animalStatus}.png`,
          opacity: 0.5,
          anchor: [0.5, 1],
          scale: 0.01,
          className: 'voc-icon'
        }),
    })
    vocalization.setStyle(vocIcon);
    vocalizedLayers.push(vocalization);
  })
  
  console.log("Vocalized Layers (vocals): ", vocalizedLayers);
  addVectorLayerTopDown(hmiState, "vocLayer");
  let layer = findMapLayerWithName(hmiState, "vocLayer");
  let layerSource = layer.getSource();
  layerSource.addFeatures(vocalizedLayers);

  //setting visibility
  //vocalizedLayers[0].getStyle().getImage().setOpacity(0.5);
  //vocalizedLayers[2].getStyle().getImage().setOpacity(0.5);
  //vocalizedLayers[1].on('click', () => {
 //   console.log("Element clicked");
  //});
}

//TESTING TO SEE IF CORRECTLY OUTPUT
function printTest(vocalizedLayers){

  vocalizedLayers.forEach((layer) => {
    console.log("Animal type: ",layer.values_.animalType)
    console.log("Animal status: ",layer.values_.animalStatus)
  })

}

function addTruthLayers(hmiState) {
  console.log("addTruthLayers called.")
  console.log("Truth locs", hmiState.trueLocations);
  hmiState.trueLocations.forEach((entry) => {
    console.log("True location found!:  ")
    var trueLocation = new ol.Feature({
      geometry: new ol.geom.Point(
        ol.proj.fromLonLat([entry.locationLon,entry.locationLat])
      ),
        name: 'trueLocation',
        animalType: entry.animalType,
        animalStatus: entry.animalStatus
      });
      console.log(entry.locationLon, " ", entry.locationLat)
    
    var trueIcon = new ol.style.Style({
        image: new ol.style.Icon({
          src: `./../images/${entry.animalType+entry.animalStatus}.png`,
          anchor: [0.5, 1],
          scale: 0.01,
          className: 'true-icon'
        }),
    })
    trueLocation.setStyle(trueIcon);
    trueLayers.push(trueLocation);
  })
  
  console.log("Truth Layers (animal locations): ", trueLayers);
  addVectorLayerTopDown(hmiState, "tLayer");
  let layer = findMapLayerWithName(hmiState, "tLayer");
  let layerSource = layer.getSource();
  layerSource.addFeatures(trueLayers);
}

function addmicrophones(hmiState) {
  var mics = [];
  
  console.log("locs", hmiState.microphoneLocations);
  hmiState.microphoneLocations.forEach((location) => {
    console.log("Mic Found")
    // Add the marker into the array
    var mic = new ol.Feature({
      geometry: new ol.geom.Point(
        ol.proj.fromLonLat([location.lon, location.lat])
      ),
      name: "mic",
    });
    var icon = new ol.style.Style({
      image: new ol.style.Icon({
        src: "./../images/microphone.png",
        anchor: [0.5, 1],
        scale: 1,
      }),
    });
    mic.setStyle(icon);
    mics.push(mic);
  });

  console.log("mics: ", mics);
  addVectorLayerTopDown(hmiState, "micLayer");
  let layer = findMapLayerWithName(hmiState, "micLayer");
  let layerSource = layer.getSource();
  layerSource.addFeatures(mics);
  
}

export function showMics(hmiState){
  let layer = findMapLayerWithName(hmiState, "micLayer");
  let layerSource = layer.getSource();
  layer.setVisible(true);
}
export function hideMics(hmiState){
  let layer = findMapLayerWithName(hmiState, "micLayer");
  let layerSource = layer.getSource();
  layer.setVisible(false);
}

function addDummyMarkers(hmiState) {
  //***Add some sample markers (WIP)***
  var markers = [];

  for (var i = 0; i < 10; i++) {
    // Compute a random icon and lon/lat position.
    var lon = hmiState.originLon + Math.random() * 0.1;
    var lat = hmiState.originLat + Math.random() * 0.1;

    // Add the marker into the array
    var mark = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
      name: "marker" + i,
    });
    var icon = new ol.style.Style({
      image: new ol.style.Icon({
        src: "./../images/" + markups[i % 3],
        anchor: [0.5, 1],
        scale: 0.01,
      }),
    });
    mark.setStyle(icon);
    markers.push(mark);
  }

  console.log("markers: ", markers);

  addVectorLayerTopDown(hmiState, "markerLayer");
  let layer = findMapLayerWithName(hmiState, "markerLayer");
  let layerSource = layer.getSource();
  layerSource.addFeatures(markers);
}

function findMapLayerWithName(hmiState, name) {
  if (!hmiState.basemap) {
    console.log(`findMapLayerWithName: invalid basemap`);
    return null;
  } else {
    let mapLayers = hmiState.basemap.getLayers();

    for (let i = 0; i < mapLayers.getLength(); ++i) {
      let currentLayer = mapLayers.item(i);
      if (currentLayer.get("name") == name) {
        return currentLayer;
      }
    }
  }

  console.log(`findMapLayerWithName: layer not found: ` + name);
  return null;
}

function addVectorLayerTopDown(hmiState, layerName) {
  addVectorLayerToBasemap(hmiState, layerName, hmiState.layerPool);
  hmiState.layerPool = hmiState.layerPool - 1;
}

function addVectorLayerToBasemap(hmiState, layerName, zIndex) {
  if (!hmiState.basemap) {
    console.log(`findMapLayerWithName: invalid basemap`);
    return null;
  } else {
    let layer = new ol.layer.Vector({
      name: layerName,
      source: new ol.source.Vector(),
      visible: true,
    });

    if (zIndex != 0) {
      layer.setZIndex(zIndex);
    }

    hmiState.basemap.addLayer(layer);
  }
}

function addWildlifeLayers(hmiState) {
  // Wildlife layers
  // Invasive, Normal, Near-Threatened, Vulnerable, Endangered
  // Mammal, Reptile, Predator, Bird, Amphibian
  for (let stat of statuses) {
    for (let animalType of animalTypes) {
      let nextName = stat + "_" + animalType;

      addVectorLayerTopDown(hmiState, nextName);
    }
  }
}

function deriveLayerName(status, animalType) {
  return status + "_" + animalType;
}

function deriveTruthLayerName(status, animalType) {
  return status + "_" + animalType + "_truth";
}

function createBasemap(hmiState) {

  var basemap = new ol.Map({
    target: "basemap",
    featureEvents: true,
    controls: ol.control.defaults({
      zoom: false,
    }),
    interactions: ol.interaction.defaults({
      constrainResolution: false,
    }),
    layers: [
      new ol.layer.Tile({
        name: "mapTileLayer",
        source: new ol.source.XYZ({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          maxZoom: 19,
        }),
      }),
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([hmiState.originLon, hmiState.originLat]),
      zoom: hmiState.defaultZoom,
    }),
  });

  hmiState.basemap = basemap;
  console.log("BASEDMAP XD LMFAO")
  return basemap;
}

function simulateData(hmiState) {}

let simUpdateTimeout = null;

function queueSimUpdate(hmiState) {
  if (simUpdateTimeout) {
    clearTimeout(simUpdateTimeout);
  }

  simUpdateTimeout = setTimeout(
    simulateData,
    hmiState.requestInterval,
    hmiState
  );
}