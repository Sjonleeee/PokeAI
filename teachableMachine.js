const MODEL_URL = "./my_model/model.json";
const METADATA_URL = "./my_model/metadata.json";
const NO_POKEMON = "No pokémon";
const API_URL = "https://api.pokemontcg.io/v2/cards?q=name:";

let pause = false;
let pokeData = [];

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
}

function reset() {
  pause = false;
  pokeData = [];
  const pokeContainer = document.getElementById("poke-container");
  while (pokeContainer.hasChildNodes()) {
    pokeContainer.removeChild(pokeContainer.firstChild);
  }
  loop();
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

async function showWebcam() {
  document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function fetchPokemon(pokeName) {
  const response = await fetch(API_URL + pokeName);
  const responseJson = await response.json();
  pokeData = responseJson.data;

  pokeContainer = document.getElementById("poke-container");

  pokeData.forEach((item) => {
    const pokeItem = pokeContainer.appendChild(document.createElement("div"));
    pokeItem.className = "grid-item";

    // Show image
    const image = pokeItem.appendChild(document.createElement("img"));
    image.src = item.images.small;
    console.log(item);

    //Show name
    const title = pokeItem.appendChild(document.createElement("h3"));
    title.innerHTML = item.name;

    //Show HP Pokémon
    const hp = pokeItem.appendChild(document.createElement("p"));
    hp.innerHTML = "hp" + item.hp;

  

    //Show link marketPlace
    const marketPlace = pokeItem.appendChild(document.createElement("a"));
    marketPlace.href = item.cardmarket.url || "#";
    marketPlace.innerHTML = item.cardmarket.url
      ? "€ Market Place €"
      : "Not available on the market";
       window.scrollTo({
          top: 1200,
          behavior: "smooth",
       })

    //Show prices
    const prices = pokeItem.appendChild(document.createElement("h2"));
    prices.innerHTML = item.cardmarket.prices.averageSellPrice
      ? "€" + item.cardmarket.prices.averageSellPrice
      : "Price not available";
  });
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    let pokeName = prediction[i].className;

    // toFixed() => string
    let probability = prediction[i].probability.toFixed(2);

    if (pokeName !== NO_POKEMON) {
      // Check probability
      if (parseInt(probability, 10) >= 0.8) {
        pause = true;
        await fetchPokemon(pokeName);
        window.scrollTo({
          top: 1200,
          behavior: "smooth",
        });
      }
    }
  }
}
