const MODEL_URL = "./my_model/model.json";
const METADATA_URL = "./my_model/metadata.json";
const API_URL = "https://api.pokemontcg.io/v2/cards?q=name:";
const metadata = {
  tfjsVersion: "1.3.1",
  tmVersion: "2.4.5",
  packageVersion: "0.8.4-alpha2",
  packageName: "@teachablemachine/image",
  timeStamp: "2022-10-04T18:23:54.897Z",
  userMetadata: {},
  modelName: "tm-my-image-model",
  labels: ["Dialga", "Zapdos", "No pokemon"],
  imageSize: 224,
};

let pause = false;
let pokeData = [];

let labelContainer;
let pokeContainer;

let maxPredictions;
let model;
let webcam;

async function init() {
  pokeContainer = document.getElementById("poke-container");

  model = await tmImage.load(MODEL_URL, METADATA_URL);
  maxPredictions = model.getTotalClasses();

  await webcamSetup();
  await showWebcam();
  
  showLabels();
}

async function webcamSetup() {
  webcam = new tmImage.Webcam(200, 200, true);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);
}
async function loop() {
  webcam.update();
  await predict();

  // Play & pause
  if (pause) return;
  window.requestAnimationFrame(loop);
}

function showLabels() {
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function showWebcam() {
  document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function fetchPokemon(pokeName) {
  const response = await fetch(API_URL + pokeName);
  const responseJson = await response.json();
  pokeData = responseJson.data;
  pokeContainer.appendChild(document.createElement("div"));

  // Next step loop pokédata and display all content
  // For each schrijven
  // https://www.w3schools.com/jsref/jsref_foreach.asp zoek op
  // for each op poke data, in de foreach maak div regel 68
  pokeContainer.childNodes[0].innerHTML = "HALLO";
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
      let pokeName = prediction[i].className;

      // toFixed() => string
      let probability = prediction[i].probability.toFixed(2);
      labelContainer.childNodes[i].innerHTML = pokeName + ": " + probability;

      if (pokeName !== "No pokemon") {
        // Check probability
        if (parseInt(probability, 10) >= 0.9) {
          pause = true;
          await fetchPokemon(pokeName);
        }
      }
    }

}
