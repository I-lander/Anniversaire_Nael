import Main from 'electron/main';
import { MainScene } from './scenes/MainScene';

export class LoseScreen extends Phaser.GameObjects.Container {
  mainScene: MainScene;

  constructor(mainScene: MainScene) {
    super(mainScene);
    this.mainScene = mainScene;

    this.mainScene.add.existing(this);

    const overlay = this.mainScene.add
      .rectangle(0, 0, this.mainScene.scale.width, this.mainScene.scale.height, 0x000000, 0.7)
      .setOrigin(0);
    const retryButton = this.mainScene.add
      .text(
        this.mainScene.cameras.main.centerX,
        this.mainScene.cameras.main.centerY,
        'Perdu !\nClique pour rejouer',
        {
          fontFamily: 'Josefinsans',
          fontSize: this.mainScene.baseUnit * 1.5 + 'px',
          color: '#FFFFFF',
          align: 'center',
        },
      )
      .setOrigin(0.5);

    retryButton.setDepth(1);

    this.add(overlay);
    this.add(retryButton);
    this.add(
      this.mainScene.add
        .rectangle(0, 0, this.mainScene.scale.width, this.mainScene.scale.height, 0x000000, 0)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.mainScene.reset();
          this.destroy();
        }),
    );
    this.setDepth(10);
  }
}
