import { MainScene } from "./scenes/MainScene";

export class ExplosiveBalls extends Phaser.GameObjects.Graphics {
		mainScene: MainScene;

		constructor(mainScene: MainScene) {
			super(mainScene);
			this.mainScene = mainScene;
			this.mainScene.add.existing(this);
		}
}