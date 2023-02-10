import * as PIXI from "pixi.js";

export default class TextField extends PIXI.Graphics {
  constructor(x, y, width, decriptionText, dynamicText) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.decriptionText = decriptionText;
    this.dynamicText = dynamicText;

    const styleDescription = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 65,
      fontWeight: "bold",
      fill: ["#c2c1c3"],
      stroke: "#063970",
      strokeThickness: 3,
      align: "center",
      dropShadow: true,
      dropShadowColor: "#495371",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 1,
    });

    const styleDynamic = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 60,
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

    const height = 105;

    this.decriptionText = new PIXI.Text(this.decriptionText, styleDescription);
    this.dynamicText = new PIXI.Text(this.dynamicText, styleDynamic);
    this.dynamicText.anchor.set(0.5, 0, 5);

    this.lineStyle(3, 0x632626, 1);
    this.beginFill(0x9d5353, 1);
    this.drawRoundedRect(this.x, this.y, width, height, 5);
    this.endFill();

    this.dynamicText.x = this.x + this.width / 2;
    this.dynamicText.y = this.y + (height - this.dynamicText.height) / 2;

    this.addChild(this.dynamicText);

    this.decriptionText.x = this.x - this.decriptionText.width - 30;
    this.decriptionText.y = this.y + (height - this.dynamicText.height) / 2;

    this.addChild(this.decriptionText);
  }
  setText(text) {
    this.dynamicText.text = text;
  }
}
