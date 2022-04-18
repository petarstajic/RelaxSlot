import * as PIXI from "pixi.js";

export default class TextField extends PIXI.Graphics {
  constructor(x, y, decriptionText, dynamicText) {
    super();
    this.x = x;
    this.y = y;
    this.decriptionText = decriptionText;
    this.dynamicText = dynamicText;
  }

  makeTextField() {
    const styleDescription = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 17,
      fontWeight: "bold",
      fill: ["#BF8B67"],
      stroke: "#063970",
      strokeThickness: 3,
      align: "center",
      dropShadow: true,
      dropShadowColor: "#495371",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 1
    });

    const styleDynamic = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 35,
      fontWeight: "bold",
      fill: ["#ffffff", "#d1d1d1"],
      stroke: "#063970",
      strokeThickness: 3,
      align: "center",
      dropShadow: true,
      dropShadowColor: "#495371",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 1
    });

    const height = 40;

    this.decriptionText = new PIXI.Text(this.decriptionText, styleDescription);
    this.dynamicText = new PIXI.Text(this.dynamicText, styleDynamic);

    this.lineStyle(3, 0x632626, 1);
    this.beginFill(0x9d5353, 1);
    this.drawRoundedRect(this.x, this.y, this.decriptionText.width, height, 5);
    this.endFill();

    this.decriptionText.x =
      this.x + (this.width - this.decriptionText.width) / 2;
    this.decriptionText.y = this.y + height;

    this.addChild(this.decriptionText);

    this.dynamicText.x = this.x + (this.width - this.dynamicText.width) / 2;
    this.dynamicText.y = this.y + (height - this.dynamicText.height) / 2;

    this.addChild(this.dynamicText);

    return this;
  }

  setText(text) {
    return (this.dynamicText.text = text);
  }
}
