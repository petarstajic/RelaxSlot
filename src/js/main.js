import * as PIXI from "pixi.js";
import GameButton from "./button";
import TextField from "./textField";
import { gsap } from "gsap";

// Constants to define the game width and height
const gameWidth = 1400;
const gameHeight = 1200;

// Creating a PIXI.js application with specified width, height, resolution and autoDensity
const app = new PIXI.Application({
  width: gameWidth,
  height: gameHeight,
  resolution: 3,
  autoDensity: true,
});

// State object that stores important and commonly used info
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
  win: 0,
  running: false,
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
  payTable: [
    [0, 0, 2, 5, 10], // Symbol_1
    [0, 0, 2, 5, 10], // Symbol_2
    [0, 0, 2, 5, 10], // Symbol_3
    [0, 0, 2, 5, 10], // Symbol_4
    [0, 0, 5, 20, 50], // Symbol_5
    [0, 0, 5, 30, 60], // Symbol_6
    [0, 0, 10, 50, 80], // Symbol_7
    [0, 0, 15, 70, 100], // Symbol_8
    [0, 0, 20, 100, 200], // Symbol_9
  ],
  nums: [],
};

// Array to store the reels
const reels = [];

resizeHandler();

document.body.appendChild(app.view);

// Resize function to handle the responsive resizing of the window
function resizeHandler() {
  const w = Math.max(window.innerWidth, document.documentElement.clientWidth);
  const h = Math.max(window.innerHeight, document.documentElement.clientHeight);

  // Calculate the scale factor based on the window width and height
  const scaleFactor = Math.min(w / gameWidth, h / gameHeight);

  const newWidth = Math.ceil(gameWidth * scaleFactor);
  const newHeight = Math.ceil(gameHeight * scaleFactor);

  // Resize the renderer and stage with the new calculated dimensions
  app.renderer.resize(newWidth * 0.9, newHeight * 0.9);
  app.stage.scale.set(scaleFactor * 0.9);
}

// Add the event listener for resize
window.addEventListener(["resize"], resizeHandler);

// Load the symbols and frame as assets
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

  .load(onAssetsLoaded);

// Constants for reel width and symbol size
const REEL_WIDTH = 260;
const SYMBOL_SIZE = 270;

// onAssetsLoaded handler
function onAssetsLoaded(loader, resources) {
  // Create textures from symbols
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

  // Symbol names
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

  // Create background sprite
  const background = new PIXI.Sprite(resources.frame.texture);
  app.stage.addChild(background);
  background.width = gameWidth;
  background.height = gameHeight;

  // Create container for reels
  const reelContainer = new PIXI.Container();

  // Create 5 reels
  for (let i = 0; i < 5; i++) {
    // Container for each reel
    const rc = new PIXI.Container();
    // Set the x position of the container based on its index
    rc.x = i * REEL_WIDTH + SYMBOL_SIZE / 2;
    rc.y = SYMBOL_SIZE / 2;
    // Add the container to the main reels container
    reelContainer.addChild(rc);

    // Object to store information about each reel
    const reel = {
      container: rc,
      symbols: [],
      position: 0,
      previousPosition: 0,
    };

    // Loop through and create symbols for each reel
    for (let j = 0; j < 12; j++) {
      // Randomly select a texture for the symbol
      const rand = Math.floor(Math.random() * slotTextures.length);
      // Create a sprite for the symbol
      const symbol = new PIXI.Sprite(slotTextures[rand]);
      // Set the symbol's name to the corresponding symbol name
      symbol.name = symbols[rand];
      symbol.anchor.set(0.5);
      // Set the symbol's y position based on its index
      symbol.y = j * SYMBOL_SIZE;
      // Scale the symbol to fit the symbol area
      symbol.scale.x = symbol.scale.y = Math.min(
        SYMBOL_SIZE / symbol.width,
        SYMBOL_SIZE / symbol.height
      );
      // Set the symbol's x position to center it in the symbol area
      symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
      // Add the symbol to the symbols array for the reel
      reel.symbols.push(symbol);
      // Add the symbol to the reel container
      rc.addChild(symbol);
    }
    // Add the reel to the reels array
    reels.push(reel);
  }
  // Add the main reel container to the stage
  app.stage.addChild(reelContainer);

  // Create a container for the winText elements
  let winTextContainer = new PIXI.Container();
  app.stage.addChild(winTextContainer);
  // Set the initial opacity and visibility for the winTextContainer
  winTextContainer.alpha = 0;
  winTextContainer.visible = false;

  // Set the initial position for the main reel container
  reelContainer.y = -112;
  reelContainer.x = (1400 - reelContainer.width) / 2;

  // Create a mask for the main reel container
  const reelMask = new PIXI.Graphics();
  app.stage.addChild(reelMask);
  // Draw a rectangle to define the area of the mask
  reelMask.beginFill();
  reelMask.drawRect(
    reelContainer.x,
    reelContainer.y + SYMBOL_SIZE,
    reelContainer.width,
    SYMBOL_SIZE * 3
  );
  reelMask.endFill();
  // Set the reel container's mask to the created mask
  reelContainer.mask = reelMask;

  // Create text field objects for the win, credits, and bet
  const winText = new TextField(560, 16, 200, "WIN: ", `${state.win}`);

  winTextContainer.addChild(winText);

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

  // Create button objects for the bet and play
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

  // Add the 'pointerdown' event listener for the playButton
  playButton.addListener("pointerdown", () => {
    // Check for winTextContainer fading
    if (!state.running && state.isWin) {
      fadeOutWin();
    }

    // Check for activation of spin (play) button
    if (!state.running && state.credit >= state.bet) {
      startPlay();
      state.credit -= state.bet;
      creditsText.setText(`${state.credit}`);
    }
  });

  // Add the 'pointerdown' event listener for the betPlusButton
  betPlusButton.addListener("pointerdown", () => {
    //Checks for activation of betPlus button
    if (!state.running) {
      if (state.bet < state.credit) {
        state.bet++;
      } else state.bet = state.credit;
      betText.setText(state.bet);
    }
  });

  // Add the 'pointerdown' event listener for the betMinusButton
  betMinusButton.addListener("pointerdown", () => {
    //Checks for activation of betMinus button
    if (!state.running) {
      if (state.bet > 1) {
        state.bet--;
      } else state.bet = 1;
      betText.setText(state.bet);
    }
  });

  //Function for setting the bet
  function setBet() {
    if (state.credit < state.bet) {
      state.bet = state.credit;
      return state.bet;
    } else {
      return state.bet;
    }
  }

  //Function for setting the win
  function setWin() {
    // Initialize a counter variable
    let counter = 0;

    // Define the ` animateWin` function to update the win text => animated counter
    const animateWin = () => {
      if (counter < state.win) {
        counter++;
        // Update the win text with the current counter value
        winText.setText(`${counter}`);
      } else {
        // If counter is equal to the win value, clear the interval
        clearInterval(countWin);
        // Increase the credit by the current win value
        state.credit += state.win;
        // Update the credit text with the new credit value
        creditsText.setText(`${state.credit}`);
        // Set the running state to false
        state.running = false;
      }
    };

    // Set an interval to call the `animateWin` function every `1000 / state.win` milliseconds
    const countWin = setInterval(animateWin, 1000 / state.win);
  }

  // Function to fade out the win text
  function fadeOutWin() {
    // Use GSAP to animate the opacity of the win text container to 0
    gsap.to(winTextContainer, {
      alpha: 0,
      duration: 1,
      // When the animation is complete, set the visibility of the container to false
      onComplete: () => {
        winTextContainer.visible = false;
      },
    });
  }

  // Arrays to store GSAP tweens for filters and scales ( for easier kill of gsap tweens on affected symbols)
  let tweenFilter = [];
  let tweenScale = [];

  // Function to start playing
  function startPlay() {
    // If the game is running or the credit is 0, return without doing anything
    if (state.running || state.credit === 0) return;
    // Set the running state to true
    state.running = true;

    // Increment the round counter
    state.roundCounter++;

    // Clean the GSAP tweens and filters for the previous round
    if (state.roundCounter > 0) {
      reels.forEach((reel) => {
        // Clear the filters for each symbol in the reels
        reel.symbols.forEach((symbol) => (symbol.filters = null));
      });
      // Kill the scale tweens for each symbol
      tweenScale.forEach((el) => {
        el.duration();
        el.kill();
      });
      // Kill the filter tweens for each symbol
      tweenFilter.forEach((el) => {
        el.duration();
        el.kill();
      });
    }

    // Generate a random symbol index
    let randomSym = Math.floor(Math.random() * slotTextures.length);

    // Generate a random winline
    let randomWin =
      state.winlines[Math.floor(Math.random() * state.winlines.length)];

    //targeted screen symbols implementation
    // Iterate over the reels
    for (let i = 0; i < reels.length; i++) {
      // Return if the current reel is undefined
      if (!reels[i]) {
        return;
      }

      // Get the current reel
      const r = reels[i];

      // Calculate extra offset
      const extra = Math.floor(Math.random() * 3);

      // Calculate the target position
      let target = Math.round(r.position + (i + 1) * 14 + extra);

      // Calculate the symbol index to display on the screen
      let num = target % r.symbols.length;

      // Check the num value and set it accordingly
      if (num === 2) {
        num = 0;
      } else if (num === 1) {
        num = 1;
      } else if (num === 0) {
        num = 2;
      } else {
        num = 14 - num;
      }

      // Set the calculated num to state.nums
      state.nums[i] = num;

      // Loop through the rows of symbols on the screen
      for (let j = 0; j < 3; j++) {
        // Calculate the symbol index
        let symNum = (num + j) % 12;

        //Implementaton of winning every 4th consecutive spin
        // Check if it's the 4th round and the symbol matches the randomWin
        if (state.roundCounter % 4 == 0 && j == randomWin[i]) {
          //Insert winline inside screen
          reels[i].symbols[symNum].texture = slotTextures[randomSym];
          reels[i].symbols[symNum].name = symbols[randomSym];
        }

        //insert symbols names to state.screen matrix
        let stateSymbol = reels[i].symbols[symNum].name;
        state.screen[j][i] = symbols.indexOf(stateSymbol);
      }

      // Animation for the final screen symbols
      let time = (i + 1) * 0.7;
      let backout = 0.8 - (i + 1) / 10;

      // Use GSAP to animate the reel
      gsap.to(r, {
        position: target,
        duration: time,
        delay: 0.1,
        ease: `back.out(${backout})`,

        // On animation complete
        onComplete: () => {
          // Check if it's the last reel
          if (i === reels.length - 1) {
            // If there's a win
            if (state.isWin) {
              // Loop through the reels
              for (let i = 0; i < reels.length; i++) {
                // Loop through the rows of symbols
                for (let j = 0; j < 3; j++) {
                  // Check if the symbol is affected
                  if (state.affectedSymbols[j][i] === 1) {
                    // Calculate the symbol index
                    let symNum = (state.nums[i] + j) % 12;
                    //push GSAP tweens to array
                    tweenScale.push(
                      //GSAP scale animation for affected win symbols
                      gsap.to(reels[i].symbols[symNum].scale, {
                        x: 1.1,
                        y: 1.1,
                        duration: 0.5,
                        repeat: -1,
                        yoyo: true,
                      })
                    );

                    //GSAP tween with PIXI filter
                    const filter = new PIXI.filters.ColorMatrixFilter();
                    reels[i].symbols[symNum].filters = [filter];
                    //push GSAP tweens to array
                    tweenFilter.push(
                      //GSAP filter/brightness animation for affected win symbols
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

              //GSAP fade in animation for winTextContainer ( on last reel when win is present)
              gsap.to(winTextContainer, {
                alpha: 1,
                duration: 1,
                onStart: () => {
                  //initial win text setting
                  winText.setText("0");
                  winTextContainer.visible = true;
                },
                onComplete: () => {
                  //funtction to set win and animate win counter
                  setWin();
                },
              });
            }

            // If there's no win, set the running state to false
            if (!state.isWin) {
              state.running = false;
            }
            // Update the credits and bet text
            creditsText.setText(`${state.credit}`);
            betText.setText(setBet());
          }
        },
      });
    }

    //log screen
    console.log("screen", state.screen);

    //check for win
    checkWin();

    // CheckWin function
    function checkWin() {
      // Initialize win state variables
      state.win = 0;
      state.isWin = false;
      state.affectedSymbols = [];
      let winSymbol = null;
      let affectedSymbols = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ];

      // Loop through win lines
      state.winlines.forEach((winline) => {
        // Initialize match variables
        let symbolMatch = 0;
        let lastWasMatch = true;
        // Loop through each symbol in the win line
        for (let i = 0; i < winline.length - 1; i++) {
          if (
            // Check if the current symbol matches the next symbol
            lastWasMatch &&
            state.screen[winline[i]][i] === state.screen[winline[i + 1]][i + 1]
          ) {
            symbolMatch++;
            winSymbol = state.screen[winline[i]][i];
          } else {
            lastWasMatch = false;
          }
        }
        // If there are two or more matching symbols, calculate win amount
        if (symbolMatch >= 2) {
          for (let i = 0; i <= symbolMatch; i++) {
            // Set the affected symbols
            affectedSymbols[winline[i]][i] = 1;
          }
          // Calculate win
          state.win += state.bet * state.payTable[winSymbol][symbolMatch];
          console.log(
            "win = ",
            state.bet,
            " x ",
            state.payTable[winSymbol][symbolMatch],
            " = ",
            state.bet * state.payTable[winSymbol][symbolMatch],
            ", totalwin = ",
            state.win
          );
          state.isWin = true;
        }
      });

      // If there is a win, set the affected symbols
      if (state.isWin) {
        state.affectedSymbols = affectedSymbols.map(function(arr) {
          return arr.slice();
        });
      } else {
        state.win = 0;
      }

      // Log win state
      console.log("isWin: ", state.isWin);
      console.log("affected state:", state.affectedSymbols);
    }
  }

  // Ticker function to update symbol positions on reels
  app.ticker.add(() => {
    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];

      // Loop through symbols on reel and update symbol positions
      for (let j = 0; j < r.symbols.length; j++) {
        const s = r.symbols[j];
        const prevy = s.y;
        s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
        if (s.y < 0 && prevy > SYMBOL_SIZE) {
          // Update symbol texture if it goes over
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
