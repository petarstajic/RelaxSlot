import * as PIXI from "pixi.js";
import GameButton from "./button";
import TextField from "./textField";
import { gsap } from "gsap";

const gameWidth = 1400;
const gameHeight = 1200;

const app = new PIXI.Application({
  width: gameWidth,
  height: gameHeight,
  resolution: 3,
  autoDensity: true,
});

const state = {
  screen: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  affectedSymbols: [],
  isWin: false,
  credit: 100,
  bet: 5,
  cheatReels: [3, 3, 3, 3, 3],
  roundCounter: 0,
  winlines: [
    [0, 0, 0, 0, 0], //1
    [1, 1, 1, 1, 1], //2
    [2, 2, 2, 2, 2], //3
    [0, 1, 2, 1, 0], //4
    [2, 1, 0, 1, 2], //5
    [2, 2, 1, 0, 0], //6
    [1, 2, 2, 2, 1], //7
    [1, 0, 0, 0, 1], //8
    [0, 1, 1, 1, 2], //9
  ],
  nums: [],
};

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
  .add("assets/Symbol_1.png", "assets/Symbol_1.png")
  .add("assets/Symbol_2.png", "assets/Symbol_2.png")
  .add("assets/Symbol_3.png", "assets/Symbol_3.png")
  .add("assets/Symbol_4.png", "assets/Symbol_4.png")
  .add("assets/Symbol_5.png", "assets/Symbol_5.png")
  .add("assets/Symbol_6.png", "assets/Symbol_6.png")
  .add("assets/Symbol_7.png", "assets/Symbol_7.png")
  .add("assets/Symbol_8.png", "assets/Symbol_8.png")
  .add("assets/Symbol_9.png", "assets/Symbol_9.png")
  .add("frame", "assets/Frame.png")

  .add("spritesheet", "assets/coin.json")
  .load(onAssetsLoaded);

const REEL_WIDTH = 260;
const SYMBOL_SIZE = 260;

// onAssetsLoaded handler builds the example.
function onAssetsLoaded(loader, resources) {
  // Create different slot symbols.
  const slotTextures = [
    PIXI.Texture.from("assets/Symbol_1.png"),
    PIXI.Texture.from("assets/Symbol_2.png"),
    PIXI.Texture.from("assets/Symbol_3.png"),
    PIXI.Texture.from("assets/Symbol_4.png"),
    PIXI.Texture.from("assets/Symbol_5.png"),
    PIXI.Texture.from("assets/Symbol_6.png"),
    PIXI.Texture.from("assets/Symbol_7.png"),
    PIXI.Texture.from("assets/Symbol_8.png"),
    PIXI.Texture.from("assets/Symbol_9.png"),
  ];

  const symbols = [
    "Symbol_1",
    "Symbol_2",
    "Symbol_3",
    "Symbol_4",
    "Symbol_5",
    "Symbol_6",
    "Symbol_7",
    "Symbol_8",
    "Symbol_9",
  ];

  const background = new PIXI.Sprite(resources.frame.texture);
  app.stage.addChild(background);
  background.width = gameWidth;
  background.height = gameHeight;

  const reelContainer = new PIXI.Container();

  for (let i = 0; i < 5; i++) {
    const rc = new PIXI.Container();
    rc.x = i * REEL_WIDTH + SYMBOL_SIZE / 2;
    rc.y = SYMBOL_SIZE / 2;
    reelContainer.addChild(rc);

    const reel = {
      container: rc,
      symbols: [],
      position: 0,
      previousPosition: 0,
    };

    // Build the symbols
    for (let j = 0; j < 12; j++) {
      const rand = Math.floor(Math.random() * slotTextures.length);
      const symbol = new PIXI.Sprite(slotTextures[rand]);
      symbol.name = symbols[rand];
      symbol.anchor.set(0.5);
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

  reelContainer.y = -90;
  reelContainer.x = (1400 - reelContainer.width) / 2;

  const reelMask = new PIXI.Graphics();
  app.stage.addChild(reelMask);
  reelMask.beginFill();
  reelMask.drawRect(
    reelContainer.x,
    reelContainer.y + SYMBOL_SIZE,
    reelContainer.width,
    SYMBOL_SIZE * 3
  );
  reelMask.endFill();
  reelContainer.mask = reelMask;

  //text class objects
  const creditsText = new TextField(
    200,
    16,
    200,
    "CREDITS:",
    `${state.credit}`
  );

  app.stage.addChild(creditsText);

  const betText = new TextField(84, 512, 200, "", `${state.bet}`);

  app.stage.addChild(betText);

  let interactiveElements = [];

  //buttons class objects
  const betPlusButton = new GameButton(150, 445, 80, 80, ">", 0x76b5c5, 1.3);

  interactiveElements.push(betPlusButton);

  const betMinusButton = new GameButton(40, 445, 80, 80, "<", 0x76b5c5, 1.3);

  interactiveElements.push(betMinusButton);

  const playButton = new GameButton(400, 445, 80, 300, "SPIN", 0x85c88a, 1.3);

  interactiveElements.push(playButton);

  app.stage.addChild(...interactiveElements);

  // Set the interactivity for buttons objects
  interactiveElements.forEach((e) => {
    e.interactive = true;
    e.buttonMode = true;
  });

  playButton.addListener("pointerdown", () => {
    if (!running && state.credit >= state.bet) {
      startPlay();
      state.credit -= state.bet;
      creditsText.setText(`${state.credit}`);
    }
  });
  betPlusButton.addListener("pointerdown", () => {
    if (!running) {
      if (state.bet < state.credit) {
        state.bet++;
      } else state.bet = state.credit;
      betText.setText(state.bet);
    }
  });
  betMinusButton.addListener("pointerdown", () => {
    if (!running) {
      if (state.bet > 1) {
        state.bet--;
      } else state.bet = 1;
      betText.setText(state.bet);
    }
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

  let tweenFilter = [];
  let tweenScale = [];

  // Function to start playing
  function startPlay() {
    if (running || state.credit === 0) return;
    running = true;
    //spiner container visibility
    if (game.visible) {
      game.visible = false;
    }

    state.roundCounter++;

    //cleaning gsap tweens and filters

    if (state.roundCounter > 0) {
      reels.forEach((reel) => {
        reel.symbols.forEach((symbol) => (symbol.filters = null));
      });
      tweenScale.forEach((el) => {
        el.duration();
        el.kill();
      });
      tweenFilter.forEach((el) => {
        el.duration();
        el.kill();
      });
    }

    let randomSym = Math.floor(Math.random() * slotTextures.length);

    let randomWin =
      state.winlines[Math.floor(Math.random() * state.winlines.length)];

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

      state.nums[i] = num;

      for (let j = 0; j < 3; j++) {
        let symNum = (num + j) % 12;
        //reels[i], (symbols[symNum].filter = null);

        if (state.roundCounter % 4 == 0 && j == randomWin[i]) {
          reels[i].symbols[symNum].texture = slotTextures[randomSym];
          reels[i].symbols[symNum].name = symbols[randomSym];
        }

        let stateSymbol1 = reels[i].symbols[symNum].name;
        //let ime = stateSymbol1.name;
        state.screen[j][i] = symbols.indexOf(stateSymbol1);
      }

      //animation for final screen symbols
      let time = (i + 1) * 0.7;

      let backout = 0.8 - (i + 1) / 10;
      //console.log("cheat reels",state.cheatReels);

      gsap.to(r, {
        position: target,
        duration: time,
        delay: 0.1,
        ease: `back.out(${backout})`,

        onComplete: () => {
          if (i === reels.length - 1) {
            if (state.isWin) {
              for (let i = 0; i < reels.length; i++) {
                for (let j = 0; j < 3; j++) {
                  if (state.affectedSymbols[j][i] === 1) {
                    let symNum = (state.nums[i] + j) % 12;
                    tweenScale.push(
                      gsap.to(reels[i].symbols[symNum].scale, {
                        x: 1.1,
                        y: 1.1,
                        duration: 0.5,
                        repeat: -1,
                        yoyo: true,
                      })
                    );
                    const filter = new PIXI.filters.ColorMatrixFilter();
                    reels[i].symbols[symNum].filters = [filter];
                    tweenFilter.push(
                      gsap.to(filter, {
                        brightness: 1,
                        duration: 0.5,
                        yoyo: true,
                        repeat: -1,
                      })
                    );
                  }
                }
              }

              state.credit += state.bet;
            }

            running = false;
            //text update

            creditsText.setText(`${state.credit}`);
            betText.setText(setBet());
          }
        },
      });
    }

    console.log("screen", state.screen);

    checkWin();

    function checkWin() {
      state.isWin = false;
      let affectedSymbols = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ];
      state.winlines.forEach((winline) => {
        let symbolMatch = 0;
        let lastWasMatch = true;
        for (let i = 0; i < winline.length - 1; i++) {
          if (
            lastWasMatch &&
            state.screen[winline[i]][i] === state.screen[winline[i + 1]][i + 1]
          ) {
            symbolMatch++;
          } else {
            lastWasMatch = false;
          }
        }
        if (symbolMatch >= 2) {
          for (let i = 0; i <= symbolMatch; i++) {
            affectedSymbols[winline[i]][i] = 1;
          }
          state.isWin = true;
        }
      });
      if (state.isWin) {
        state.affectedSymbols = affectedSymbols.map(function(arr) {
          return arr.slice();
        });
      }
      console.log("isWin: ", state.isWin);
      console.log("affected state:", state.affectedSymbols);
    }
  }

  app.ticker.add((delta) => {
    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];

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
