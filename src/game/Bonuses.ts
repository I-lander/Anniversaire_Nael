import { Ball } from './Ball';
import { ExplosiveBall } from './ExplosiveBall';
import { MainScene } from './scenes/MainScene';

export class Bonuses extends Phaser.GameObjects.Image {
  mainScene: MainScene;
  x: number;
  y: number;
  speed: number = 100;
  bonusTypes: string[] = [
    'expandPaddle',
    'shrinkPaddle',
    'extraLife',
    'multiBall',
    'slowBall',
    'fastBall',
    'explosiveBall',
  ];
  bonusType: string;
  isActive: boolean = true;

  constructor(mainScene: MainScene, x: number, y: number) {
    super(mainScene, x, y, 'bonus');
    this.mainScene = mainScene;
    this.x = x;
    this.y = y;
    this.speed = this.mainScene.baseUnit * 6;
    this.mainScene.add.existing(this);
    this.setDepth(2);
    this.bonusType = Phaser.Math.RND.pick(this.bonusTypes);
    this.setTexture(this.bonusType);
    this.setDisplaySize(this.mainScene.baseUnit * 2, this.mainScene.baseUnit * 2);
  }

  update(delta: number) {
    if (!this.isActive) {
      return;
    }
    this.y += this.speed * (delta / 1000);
    this.checkCollisions();
  }

  checkCollisions() {
    const paddle = this.mainScene.paddleLayout;
    if (
      this.x + this.displayWidth / 2 > paddle.x &&
      this.x - this.displayWidth / 2 < paddle.x + paddle.width &&
      this.y + this.displayHeight / 2 > paddle.y &&
      this.y - this.displayHeight / 2 < paddle.y + paddle.height
    ) {
      // this.mainScene.sound.play('bonus');
      this.applyBonus();
      this.destroy();
      this.isActive = false;
    }
  }

  applyBonus() {
    switch (this.bonusType) {
      case 'expandPaddle': {
        const maxWidth = this.mainScene.scale.width * 0.75;
        const oldWidth = this.mainScene.paddleLayout.width;
        const targetWidth = Math.min(oldWidth * 1.25, maxWidth);
        const layout = this.mainScene.paddleLayout;
        this.mainScene.tweens.add({
          targets: { width: oldWidth },
          width: targetWidth,
          duration: 300,
          ease: 'Power2',
          onUpdate: (tween) => {
            const currentWidth = tween.getValue() as number;
            let newX = layout.x - (currentWidth - layout.width) / 2;
            newX = Phaser.Math.Clamp(newX, 0, this.mainScene.scale.width - currentWidth);
            layout.width = currentWidth;
            layout.x = newX;
            this.mainScene.paddle.destroy();
            this.mainScene.createPaddle();
          },
          onComplete: () => {
            layout.width = targetWidth;
            layout.x = Phaser.Math.Clamp(layout.x, 0, this.mainScene.scale.width - layout.width);
            this.mainScene.paddle.destroy();
            this.mainScene.createPaddle(layout.x, layout.y);
          },
        });
        break;
      }
      case 'shrinkPaddle': {
        const minWidth = this.mainScene.baseUnit * 2;
        const oldWidth = this.mainScene.paddleLayout.width;
        const targetWidth = Math.max(oldWidth * 0.75, minWidth);
        const layout = this.mainScene.paddleLayout;
        this.mainScene.tweens.add({
          targets: { width: oldWidth },
          width: targetWidth,
          duration: 300,
          ease: 'Power2',
          onUpdate: (tween) => {
            const currentWidth = tween.getValue() as number;
            let newX = layout.x - (currentWidth - layout.width) / 2;
            newX = Phaser.Math.Clamp(newX, 0, this.mainScene.scale.width - currentWidth);
            layout.width = currentWidth;
            layout.x = newX;
            this.mainScene.paddle.destroy();
            this.mainScene.createPaddle();
          },
          onComplete: () => {
            layout.width = targetWidth;
            layout.x = Phaser.Math.Clamp(layout.x, 0, this.mainScene.scale.width - layout.width);
            this.mainScene.paddle.destroy();
            this.mainScene.createPaddle(layout.x, layout.y);
          },
        });
        break;
      }

      case 'extraLife': {
        this.mainScene.addExtraLife();
        break;
      }
      case 'multiBall': {
        this.mainScene.balls.push(new Ball(this.mainScene, this.x, this.y));
        break;
      }
      case 'slowBall': {
        this.mainScene.balls.forEach((ball) => {
          ball.ballSpeed *= 0.8;
          if (ball.ballSpeed < ball.baseSpeed * 0.25) {
            ball.ballSpeed = ball.baseSpeed * 0.25;
          }
        });
        break;
      }
      case 'fastBall': {
        this.mainScene.balls.forEach((ball) => {
          ball.ballSpeed *= 1.2;
          if (ball.ballSpeed > ball.baseSpeed * 2) {
            ball.ballSpeed = ball.baseSpeed * 2;
          }
        });
        break;
      }
      case 'explosiveBall': {
        this.mainScene.explosiveBalls.push(new ExplosiveBall(this.mainScene, this.x, this.y));
        break;
      }
    }
  }
}
