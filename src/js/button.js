import * as PIXI from "pixi.js";

export default class GameButton extends PIXI.Graphics {
  constructor(x, y, height, width, text, color, scaleButton) {
    super();
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.text = text;
    this.color = color;
    this.scaleButton = scaleButton;

    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 45,
      //fontStyle: 'italic',
      fontWeight: "bold",
      fill: ["#ffffff", "#d1d1d1"],
      stroke: "#063970",
      strokeThickness: 3,
      align: "center",
      dropShadow: true,
      dropShadowColor: "#495371",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 1,
    });

    const playText = new PIXI.Text(this.text, style);

    this.lineStyle(3, 0xeab676, 1);
    this.beginFill(this.color, 1);
    this.drawRoundedRect(this.x, this.y, width, height, 5);
    this.endFill();

    playText.x = this.x + (this.width - playText.width) / 2;
    playText.y = this.y + (this.height - playText.height) / 2;

    this.addChild(playText);
    this.scale.set(this.scaleButton);

    this.on("pointerdown", () => {
      this.alpha = 0.7;
    });
    this.on("pointerup", () => {
      this.alpha = 1;
    });
  }
}
