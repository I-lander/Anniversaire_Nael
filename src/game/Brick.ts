import { Bonuses } from './Bonuses';
import { getColors, MainScene } from './scenes/MainScene';

const bricksLevelColors = [
  getColors('rgb(255, 120, 100)'),
  getColors('rgb(255, 200, 80)'),
  getColors('rgb(120, 230, 100)'),
  getColors('rgb(80, 150, 255)'),
];

export class Brick extends Phaser.GameObjects.Graphics {
  mainScene: MainScene;
  life: number;
  isActive: boolean = true;
  width: number;
  height: number;
  tween!: Phaser.Tweens.Tween;
  isHitTweening: boolean = false;
  row: number;
  column: number;

  constructor(
    mainScene: MainScene,
    x: number,
    y: number,
    width: number,
    height: number,
    life: number,
    row: number,
    column: number
  ) {
    super(mainScene, { x, y });
    this.mainScene = mainScene;
    this.width = width;
    this.height = height;
    this.life = life;
    this.row = row;
    this.column = column;
    this.fillStyle(bricksLevelColors[this.life - 1], 1);
    this.fillRect(0, 0, width, height);

    mainScene.add.existing(this);
  }

  onHit(strength: number = 1) {
    if (this.tween && this.tween.isPlaying()) {
      return;
    }
    this.tween = this.mainScene.add.tween({
      targets: this,
      scaleY: 1.2,
      yoyo: true,
      duration: 100,
      ease: 'Power1',
    });

    this.life -= strength;

    this.mainScene.sound.play('break');

    if (this.life <= 0) {
      const isBonus = Math.random() < 0.5;
      if (isBonus) {
        this.mainScene.bonuses.push(
          new Bonuses(this.mainScene, this.x + this.width / 2, this.y + this.height / 2),
        );
      }
      this.mainScene.add.tween({
        targets: this,
        alpha: 0,
        duration: 200,
        ease: 'Power1',
        onComplete: () => {
          this.destroy();
          this.isActive = false;
        },
      });
    } else {
      this.clear();
      this.fillStyle(bricksLevelColors[this.life - 1], 1);
      this.fillRect(0, 0, this.width, this.height);
    }
  }
}
