import * as PIXI from "pixi.js";
import GameButton from "./button";
import TextField from "./textField";
import gsap from "gsap";

const gameWidth = 600;
const gameHeight = 600;

const app = new PIXI.Application({
  width: gameWidth,
  height: gameHeight,
  backgroundColor: 0x1099bb,
  resolution: 3,
  autoDensity: true
});

const state = {
  reelSymbols: [],
  credit: 5,
  bet: 1,
  betMax: 5,
  completeReels: [[], [], []],
  cheatReels: [0, 0, 0],
  lastWasWin: true,
  winlines: [
    [1, 1, 1],
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 1]
  ],
  nums: [],
  targets: []
};

const cheatOn = true;

const reels = [];

resizeHandler();

document.body.appendChild(app.view);

//function for responsive resize

function resizeHandler() {
  const w = Math.max(window.innerWidth, document.documentElement.clientWidth);
  const h = Math.max(window.innerHeight, document.documentElement.clientHeight);

  const scaleFactor = Math.min(w / gameWidth, h / gameHeight);

  const newWidth = Math.ceil(gameWidth * scaleFactor);
  const newHeight = Math.ceil(gameHeight * scaleFactor);

  app.renderer.resize(newWidth * 0.9, newHeight * 0.9);
  app.stage.scale.set(scaleFactor * 0.9);
}

window.addEventListener(["resize"], resizeHandler);

app.loader
  .add("assets/clover.png", "assets/clover.png")
  .add("assets/crown.png", "assets/crown.png")
  .add("assets/diamond.png", "assets/diamond.png")
  .add("assets/seven.png", "assets/seven.png")
  .add("spritesheet", "assets/coin.json")
  .load(onAssetsLoaded);

const REEL_WIDTH = 140;
const SYMBOL_SIZE = 150;

// onAssetsLoaded handler builds the example.
function onAssetsLoaded(loader, resources) {
  //resizeHandler();
  // Create different slot symbols.
  const slotTextures = [
    PIXI.Texture.from("assets/clover.png"),
    PIXI.Texture.from("assets/crown.png"),
    PIXI.Texture.from("assets/diamond.png"),
    PIXI.Texture.from("assets/seven.png")
  ];

  const symbols = ["clover", "crown", "diamond", "seven"];

  const textures = [];

  for (let i = 0; i < 30; i++) {
    const framekey = `Silver_${i + 1}.png`;
    const texture = PIXI.Texture.from(framekey);
    const time = resources.spritesheet.data.frames[framekey].duration;
    textures.push({ texture, time });
  }

  const coinsContainer = new PIXI.Container();

  app.stage.addChild(coinsContainer);

  //coins win animation

  function updateCoins(coins) {
    coins.y += coins.vy;
  }

  function createCoins() {
    const coins = new PIXI.AnimatedSprite(textures);
    coins.anchor.set(0.5);
    coins.update = updateCoins;

    const speed = 800.0; // px per second
    coins.vy = speed / 60.0;
    coins.position.set(
      Math.random() * gameWidth,
      -300 + (Math.random() * gameHeight) / 3
    );
    coins.anchor.set(0.5, 0.5);
    coins.scale.set(0.2);

    let i = Math.floor(Math.random() * 30);
    const playCoins = () => {
      coins.gotoAndStop(i);
      i++;
      if (i == 30) i = 0; // At the last frame, go back to the first frame
    };
    setInterval(playCoins, 40);

    return coins;
  }

  //spinner win animation
  function generateSpinner() {
    const container = new PIXI.Container();
    container.position = new PIXI.Point(
      reelContainer.x,
      reelContainer.y + SYMBOL_SIZE * 0.7
    );
    game.addChild(container);

    const halfCircle = new PIXI.Graphics();
    halfCircle.beginFill(0xff0000);
    halfCircle.lineStyle(10, 0xffffff);
    halfCircle.arc(0, 0, reelContainer.width, 0, Math.PI);
    halfCircle.endFill();
    halfCircle.position.set(reelContainer.width / 2, (SYMBOL_SIZE * 1.6) / 2);

    const rectangle = new PIXI.Graphics();
    rectangle.lineStyle(10, 0xfff89a, 1);
    rectangle.drawRoundedRect(0, 0, reelContainer.width, SYMBOL_SIZE * 1.6, 10);
    rectangle.endFill();
    rectangle.mask = halfCircle;

    container.addChild(rectangle);
    container.addChild(halfCircle);

    return halfCircle;
  }
  //spinner win animation ratation update funciton
  function rotateSpiner(circle, delta) {
    circle.rotation += delta / 6;
    circle.rotation %= Math.PI * 2;
  }

  const reelContainer = new PIXI.Container();

  for (let i = 0; i < 3; i++) {
    const rc = new PIXI.Container();
    rc.x = i * REEL_WIDTH;
    reelContainer.addChild(rc);

    const reel = {
      container: rc,
      symbols: [],
      position: 0,
      previousPosition: 0,
      blur: new PIXI.filters.BlurFilter()
    };

    reel.blur.blurX = 0;
    reel.blur.blurY = 0;
    rc.filters = [reel.blur];

    // Build the symbols
    for (let j = 0; j < 12; j++) {
      const rand = Math.floor(Math.random() * slotTextures.length);
      const symbol = new PIXI.Sprite(slotTextures[rand]);
      symbol.name = symbols[rand];
      // Scale the symbol to fit symbol area.
      symbol.y = j * SYMBOL_SIZE;
      symbol.scale.x = symbol.scale.y = Math.min(
        SYMBOL_SIZE / symbol.width,
        SYMBOL_SIZE / symbol.height
      );
      symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
      reel.symbols.push(symbol);
      rc.addChild(symbol);
    }
    reels.push(reel);
  }
  app.stage.addChild(reelContainer);

  //container for spinnr animation
  let game = new PIXI.Container();
  app.stage.addChild(game);

  const margin = (600 - SYMBOL_SIZE * 3) / 2;
  reelContainer.y = margin - SYMBOL_SIZE / 1.5;
  reelContainer.x = (600 - reelContainer.width) / 2;

  const circle = generateSpinner();

  const reelMask = new PIXI.Graphics();
  app.stage.addChild(reelMask);
  reelMask.beginFill();
  reelMask.drawRect(
    reelContainer.x,
    reelContainer.y + SYMBOL_SIZE * 0.7,
    reelContainer.width,
    SYMBOL_SIZE * 1.6
  );
  reelMask.endFill();
  reelContainer.mask = reelMask;

  let interactiveElements = [];

  app.stage.addChild(coinsContainer);

  //buttons class objects
  const betButton = new GameButton(50, 220, "BET\nONE", 0x76b5c5, 1);

  interactiveElements.push(betButton);

  const maxBetButton = new GameButton(100, 220, "BET\nMAX", 0x76b5c5, 1);

  interactiveElements.push(maxBetButton);

  const playButton = new GameButton(145, 172, "SPIN", 0x85c88a, 1.6);

  interactiveElements.push(playButton);

  app.stage.addChild(...interactiveElements);

  //text class objects
  const creditsText = new TextField(215, 180, "CREDITS", `${state.credit}`);

  app.stage.addChild(creditsText);

  const betText = new TextField(190, 180, "BET", `${state.bet}`);

  app.stage.addChild(betText);

  // Set the interactivity for buttons objects
  interactiveElements.forEach(e => {
    e.interactive = true;
    e.buttonMode = true;
  });

  playButton.addListener("pointerdown", () => {
    startPlay();
  });
  betButton.addListener("pointerdown", () => {
    if (state.bet < state.betMax && state.bet < state.credit) {
      state.bet++;
    } else state.bet = 1;
    betText.setText(state.bet);
  });
  maxBetButton.addListener("pointerdown", () => {
    if (state.credit <= state.betMax) {
      state.bet = state.credit;
    } else {
      state.bet = state.betMax;
    }
    betText.setText(state.bet);
  });

  function setBet() {
    if (state.credit < state.bet) {
      state.bet = state.credit;
      return state.bet;
    } else {
      return state.bet;
    }
  }

  let running = false;

  game.visible = false;

  // Function to start playing
  function startPlay() {
    if (running || state.credit === 0) return;
    running = true;
    //spiner container visibility
    if (game.visible) {
      game.visible = false;
    }
    //cheat tool check for predefined winlines and cheat screen
    if (cheatOn) {
      const symbolIndexes = [0, 1, 2, 3];

      shuffleArray(symbolIndexes);

      state.lastWasWin = !state.lastWasWin;

      if (state.lastWasWin) {
        state.cheatReels = symbolIndexes.slice(0, 3);
      } else {
        let randomWin =
          state.winlines[Math.floor(Math.random() * state.winlines.length)];
        for (let i = 0; i < randomWin.length; i++) {
          state.cheatReels[i] = symbolIndexes[randomWin[i]];
        }
      }

      console.log(state.cheatReels);
    }

    //targeted screen symbols implementation
    for (let i = 0; i < reels.length; i++) {
      if (!reels[i]) {
        return;
      }

      const r = reels[i];
      const extra = Math.floor(Math.random() * 3);

      let target = Math.round(r.position + (i + 1) * 14 + extra);

      let num = target % r.symbols.length;

      if (num === 2) {
        num = 0;
      } else if (num === 1) {
        num = 1;
      } else if (num === 0) {
        num = 2;
      } else {
        num = 14 - num;
      }

      let stateSymbol = r.symbols[num];

      state.reelSymbols[i] = stateSymbol.name;

      //animation for final screen symbols
      let time = (i + 1) * 0.7;

      let backout = 0.8 - (i + 1) / 10;

      gsap.to(r, {
        position: target,
        duration: time,
        ease: `back.out(${backout})`,
        onStart: () => {
          if (cheatOn) {
            r.symbols[num].texture = slotTextures[state.cheatReels[i]];

            r.symbols[num].name = symbols[state.cheatReels[i]];
            state.reelSymbols[i] = r.symbols[num].name;
            console.log(r.symbols[num].name);
          }
        },

        onComplete: () => {
          if (i === reels.length - 1) {
            running = false;
            if (
              state.reelSymbols[0] === state.reelSymbols[1] ||
              state.reelSymbols[0] === state.reelSymbols[2] ||
              state.reelSymbols[1] === state.reelSymbols[2]
            ) {
              console.log("WIN!!!");

              game.visible = true;
              //coins animation
              for (let i = 0; i < state.bet; i++) {
                coinsContainer.addChild(createCoins());
              }

              state.credit += state.bet;
            } else {
              state.credit -= state.bet;
            }
            //text update
            creditsText.setText(`${state.credit}`);
            betText.setText(setBet());
          }
        }
      });
    }

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
  }

  app.ticker.add(delta => {
    coinsContainer.children.forEach(updateCoins);
    //spinner rotation cycle update
    rotateSpiner(circle, delta);

    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];
      // Update blur filter y amount based on speed.
      // This would be better if calculated with time in mind also. Now blur depends on frame rate.
      r.blur.blurY = (r.position - r.previousPosition) * 8;
      r.previousPosition = r.position;

      // Update symbol positions on reel.
      for (let j = 0; j < r.symbols.length; j++) {
        const s = r.symbols[j];
        const prevy = s.y;
        s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
        if (s.y < 0 && prevy > SYMBOL_SIZE) {
          // Detect going over and swap a texture.
          s.scale.x = s.scale.y = Math.min(
            SYMBOL_SIZE / s.texture.width,
            SYMBOL_SIZE / s.texture.height
          );
          s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
        }
      }
    }
  });
}
