const MODEL_URL = "./my_model/model.json";
const METADATA_URL = "./my_model/metadata.json";
const NO_POKEMON = "No pokémon";
const API_URL = "https://api.pokemontcg.io/v2/cards?q=name:";

const BEHAVIOR = "smooth";
const SCROLL_TO = 1200;

let pause = false;
let pokeData = [];

let pokeContainer;

let maxPredictions;
let model;
let webcam;

async function init() {
  pokeContainer = document.querySelector("#poke-container");
  model = await tmImage.load(MODEL_URL, METADATA_URL);
  maxPredictions = model.getTotalClasses();

  await webcamSetup();
  await showWebcam();
}

function reset() {
  pause = false;
  pokeData = [];

  // Verwijderd de Pokémon kaarten
  const pokeContainer = document.querySelector("#poke-container");
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
  // Return stopt de loop
  if (pause) return;
  window.requestAnimationFrame(loop);
}

async function showWebcam() {
  document.querySelector("#webcam-container").appendChild(webcam.canvas);
}

async function fetchPokemon(pokeName) {
  // Haalt Pokemon kaarten op van 1 pokemon uit de API URL
  const response = await fetch(API_URL + pokeName);
  const responseJson = await response.json();
  pokeData = responseJson.data;
  pokeContainer = document.querySelector("#poke-container");

  pokeData.forEach((pokemon) => {
    const pokeItem = pokeContainer.appendChild(document.createElement("div"));
    pokeItem.className = "grid-item";

    // Show image
    const image = pokeItem.appendChild(document.createElement("img"));
    image.src = pokemon.images.small;

    //Show name
    const title = pokeItem.appendChild(document.createElement("h3"));
    title.innerHTML = pokemon.name;

    //Show HP Pokémon
    const hp = pokeItem.appendChild(document.createElement("p"));
    hp.className = "pokeHp";
    hp.innerHTML = "hp" + pokemon.hp;

    //Show type of pokémon
    const types = pokeItem.appendChild(document.createElement("p"));
    types.className = "pokeTypes";
    types.innerHTML = pokemon.types;

    // Show Level
    const level = pokeItem.appendChild(document.createElement("p"));
    level.className = "pokeLevel";
    const levelValue = pokemon.level || "Not found";
    level.innerHTML = "Level: " + levelValue;
    console.log(pokemon);

    // Show subtypes
    const subtypes = pokeItem.appendChild(document.createElement("p"));
    subtypes.className = "pokeSubtypes";
    subtypes.innerHTML = pokemon.subtypes;

    // Show Rarity
    const rarity = pokeItem.appendChild(document.createElement("p"));
    rarity.className = "pokeRarity";
    rarity.innerHTML = pokemon.rarity;

    //Show artist
    const artist = pokeItem.appendChild(document.createElement("p"));
    artist.className = "pokeArtist";
    artist.innerHTML = "Artist: " + pokemon.artist;

    //Show link marketPlace
    const marketPlace = pokeItem.appendChild(document.createElement("a"));
    marketPlace.href = pokemon.cardmarket.url || " ";
    marketPlace.innerHTML = pokemon.cardmarket.url
      ? "€ Market Place €"
      : "Not available on the market";
    window.scrollTo({
      top: SCROLL_TO,
      behavior: BEHAVIOR,
    });

    //Show prices
    const prices = pokeItem.appendChild(document.createElement("h2"));
    prices.className = "pokePrices";
    prices.innerHTML = pokemon.cardmarket.prices.averageSellPrice
      ? "€" + pokemon.cardmarket.prices.averageSellPrice
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
          top: SCROLL_TO,
          behavior: BEHAVIOR,
        });
      }
    }
  }
}
