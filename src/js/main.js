import * as PIXI from "pixi.js";
import GameButton from "./button";
import TextField from "./textField";

const gameWidth = 600;
const gameHeight = 600;

const app = new PIXI.Application({
  width: gameWidth,
  height: gameHeight,
  backgroundColor: 0x1099bb,
  resolution: 3,
  autoDensity: true
});

resizeHandler();

document.body.appendChild(app.view);

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

  let state = {
    reelSymbols: [],
    credit: 5,
    bet: 1,
    betMax: 5,
    completeReels: {
      0: [],
      1: [],
      2: []
    },
    counter: 0
  };

  const textures = [];
  const coinsContainer = new PIXI.Container();

  for (let i = 0; i < 30; i++) {
    const framekey = `Silver_${i + 1}.png`;
    const texture = PIXI.Texture.from(framekey);
    const time = resources.spritesheet.data.frames[framekey].duration;
    textures.push({ texture, time });
  }

  function updateCoins(coins) {
    coins.y += coins.vy;
  }

  function createCoins() {
    const coins = new PIXI.AnimatedSprite(textures);
    coins.anchor.set(0.5);
    coins.update = updateCoins;

    const speed = 600.0; // px per second
    coins.vy = speed / 60.0;
    coins.position.set(
      Math.random() * gameWidth,
      -2000 + (Math.random() * gameHeight) / 3
    );
    coins.anchor.set(0.5, 0.5);
    coins.scale.set(0.2);

    let i = Math.floor(Math.random() * 30);
    const firePlay = () => {
      coins.gotoAndStop(i);
      i++;
      if (i == 30) i = 0; // At the last frame, go back to the first frame
    };
    setInterval(firePlay, 40);

    return coins;
  }

  const generateSpinner = position => {
    const container = new PIXI.Container();
    container.position = position;
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

    let phase = 0;

    return delta => {
      // Update phase
      phase += delta / 6;
      phase %= Math.PI * 2;

      halfCircle.rotation = phase;
    };
  };

  // Build the reels
  const reels = [];

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
      const symbol = new PIXI.Sprite(
        slotTextures[Math.floor(Math.random() * slotTextures.length)]
      );
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

  let game = new PIXI.Container();
  app.stage.addChild(game);

  const margin = (600 - SYMBOL_SIZE * 3) / 2;
  reelContainer.y = margin - SYMBOL_SIZE / 1.5;
  reelContainer.x = (600 - reelContainer.width) / 2;

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

  let onTick = [];
  let interactiveElements = [];

  app.stage.addChild(coinsContainer);

  const betButton = new GameButton(50, 220, "BET\nONE", 0x76b5c5, 1);
  betButton.makeButton();
  interactiveElements.push(betButton);

  const maxBetButton = new GameButton(100, 220, "BET\nMAX", 0x76b5c5, 1);
  maxBetButton.makeButton();
  interactiveElements.push(maxBetButton);

  const playButton = new GameButton(145, 172, "SPIN", 0x85c88a, 1.6);
  playButton.makeButton();
  interactiveElements.push(playButton);

  app.stage.addChild(...interactiveElements);

  const creditsText = new TextField(215, 180, "CREDITS", `${state.credit}`);
  creditsText.makeTextField();
  app.stage.addChild(creditsText);

  const betText = new TextField(190, 180, "BET", `${state.bet}`);
  betText.makeTextField();
  app.stage.addChild(betText);

  // Set the interactivity.
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

  // Function to start playing.
  function startPlay() {
    if (running) return;
    running = true;
    state.counter++;
    let time;

    if (onTick[0]) {
      onTick[0] = null;
      app.stage.removeChild(game);
      game = new PIXI.Container();
      app.stage.addChildAt(game, 1);
    }

    for (let i = 0; i < reels.length; i++) {
      if (!reels[i]) {
        return;
      }
      const r = reels[i];
      const extra = Math.floor(Math.random() * 3);
      // code from pixi reels example need to be Math.round-ed because of random decimal output probably caused by .position method
      // this probably can cause some other issues => didn't have time to test it thoroughly :)
      let target = Math.round(r.position + 10 + i * 15 + extra);
      time = 2500 + i * 600 + extra * 600;

      // additional task requirements in code below
      // manipulating reels to win every second round

      function changeTarget(target, i, j) {
        //locating symbols on screen using target number
        let num =
          reels[i].symbols.length - (target % reels[i].symbols.length) + j;
        num =
          num < reels[i].symbols.length ? num : num - reels[i].symbols.length;
        //pushing all 12 reel symbols from screen to state
        let stateSymbol = reels[i].symbols[
          num
        ]._texture.textureCacheIds.toString();
        state.completeReels[i][j] = stateSymbol.substring(
          7,
          stateSymbol.length - 4
        );
      }

      //loop throw every reel
      for (let j = 0; j < reels[i].symbols.length; j++) {
        //getting reels screen
        changeTarget(target, i, j);
        //checking for third symbol on reel => the one on the game screen
        if (j == 2) {
          //first loop to check every 2nd round for non-win situation and to increase target number (change symbol on the screen) in case the conditions are not fulfilled
          if (state.counter % 2 == 0) {
            while (
              (i != 0 &&
                state.completeReels[i][j] == state.completeReels[i - 1][j]) ||
              (i == 2 &&
                state.completeReels[i][j] == state.completeReels[i - 2][j])
            ) {
              target++;
              changeTarget(target, i, j);
            }
            //second loop to check every other round for win situation and increase symbols target to match all conditions
          } else {
            while (
              i == 2 &&
              state.completeReels[0][j] !== state.completeReels[1][j] &&
              state.completeReels[i][j] !== state.completeReels[i - 1][j] &&
              state.completeReels[i][j] !== state.completeReels[i - 2][j]
            ) {
              target++;
              changeTarget(target, i, j);
            }
          }

          state.reelSymbols[i] = state.completeReels[i][j];
        }
      }
      //tween animation for final screen symbols
      tweenTo(
        r,
        "position",
        target,
        time,
        backout(0.4),
        null,
        i === reels.length - 1 ? reelsComplete : null
      );

      console.log("simbol ", i + 1, " :", state.reelSymbols[i]);
    }

    if (
      !state.reelSymbols[0].localeCompare(state.reelSymbols[1]) ||
      !state.reelSymbols[0].localeCompare(state.reelSymbols[2]) ||
      !state.reelSymbols[1].localeCompare(state.reelSymbols[2])
    ) {
      setTimeout(() => {
        onTick = [
          generateSpinner(
            new PIXI.Point(reelContainer.x, reelContainer.y + SYMBOL_SIZE * 0.7)
          )
        ];
      }, time / 3);

      console.log("WIN!!!");

      for (let i = 0; i < state.bet; i++) {
        coinsContainer.addChild(createCoins());
      }

      state.credit += state.bet;
    } else {
      state.credit - state.bet <= 0
        ? setTimeout(() => {
            state.credit -= state.bet;
          }, time)
        : (state.credit -= state.bet);
    }
    console.log("credit = ", state.credit);
    setTimeout(() => {
      creditsText.setText(`${state.credit}`);
      betText.setText(setBet());
    }, time);
  }

  // Reels done handler.
  function reelsComplete() {
    running = false;
  }

  // Listen for animate update.
  app.ticker.add(delta => {
    if (state.credit <= 0) {
      running = true;
      return;
    }

    coinsContainer.children.forEach(updateCoins);
    // Update the slots.
    if (onTick[0]) {
      onTick.forEach(cb => {
        cb(delta);
      });
    }

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
          // This should in proper product be determined from some logical reel.
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

// Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
const tweening = [];
function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
  const tween = {
    object,
    property,
    propertyBeginValue: object[property],
    target,
    easing,
    time,
    change: onchange,
    complete: oncomplete,
    start: Date.now()
  };

  tweening.push(tween);
  return tween;
}
// Listen for animate update.
app.ticker.add(delta => {
  const now = Date.now();
  const remove = [];
  for (let i = 0; i < tweening.length; i++) {
    const t = tweening[i];
    const phase = Math.min(1, (now - t.start) / t.time);

    t.object[t.property] = lerp(
      t.propertyBeginValue,
      t.target,
      t.easing(phase)
    );
    if (t.change) t.change(t);
    if (phase === 1) {
      t.object[t.property] = t.target;
      if (t.complete) t.complete(t);
      remove.push(t);
    }
  }
  for (let i = 0; i < remove.length; i++) {
    tweening.splice(tweening.indexOf(remove[i]), 1);
  }
});

// Basic lerp funtion.
function lerp(a1, a2, t) {
  return a1 * (1 - t) + a2 * t;
}

// Backout function from tweenjs.
function backout(amount) {
  return t => --t * t * ((amount + 1) * t + amount) + 1;
}
