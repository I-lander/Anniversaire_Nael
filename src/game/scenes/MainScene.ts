import { Ball } from '../Ball';
import { BricksPattern, bricksPattern } from '../bircksPattern';
import { Bonuses } from '../Bonuses';
import { Brick } from '../Brick';
import { ExplosiveBall } from '../ExplosiveBall';
import { LoseScreen } from '../LoseScreen';

export class MainScene extends Phaser.Scene {
  bricks: Brick[] = [];
  brickRows: number = 12;
  brickColumns: number = 8;
  paddle!: Phaser.GameObjects.Container;
  isPaddleTweening: boolean = false;
  face!: Phaser.GameObjects.Image;
  paddleLayout!: { x: number; y: number; width: number; height: number };
  baseUnit!: number;
  balls: Ball[] = [];
  bonuses: Bonuses[] = [];
  explosiveBalls: ExplosiveBall[] = [];

  offsetY: number = 3;

  lifes: number = 3;
  maxLifes: number = 6;
  lifesImages: Phaser.GameObjects.Image[] = [];

  level: number = 1;

  message!: Phaser.GameObjects.Image;
  loseContainer!: LoseScreen;

  startScreenContainer!: Phaser.GameObjects.Container;

  isGameStarted: boolean = false;
  isGameEnded: boolean = false;

  isLogging: boolean = false;

  constructor() {
    super('MainScene');
  }

  preload() {}

  create() {
    this.time.delayedCall(1000, () => {
      this.scale.refresh();
    });

    this.baseUnit = this.scale.width / this.brickColumns / 2;
    this.paddleLayout = {
      x: 0,
      y: this.cameras.main.height - this.baseUnit / 2 - this.baseUnit,
      width: this.baseUnit * 6,
      height: this.baseUnit,
    };
    this.balls.push(
      new Ball(this, this.cameras.main.centerX, this.cameras.main.centerY + this.baseUnit * 2),
    );
    this.createPaddle();
    this.createBricks();

    this.message = this.add
      .image(this.cameras.main.centerX, this.baseUnit * this.offsetY, 'message')
      .setOrigin(0.5, 0)
      .setScale(0.75)
      .setDepth(-1)
      .setAlpha(0);

    this.sound.play('click', { volume: 3 });
    this.sound.play('music', { loop: true, volume: 0.1 });

    this.startScreenContainer = this.add.container(0, 0);
    const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5);
    overlay.setOrigin(0);
    this.startScreenContainer.add(overlay);

    const startText = this.add
      .text(this.cameras.main.centerX, this.cameras.main.centerY, 'Click pour commencer', {
        fontFamily: 'Josefinsans',
        fontSize: `${this.baseUnit * 1.2}px`,
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.startScreenContainer.add([overlay, startText]).setDepth(5);

    for (let i = 0; i < this.lifes; i++) {
      this.addExtraLife();
    }

    this.input.on('pointerdown', () => {
      this.isGameStarted = true;
      this.startScreenContainer.destroy();
    });

    addEventListener('pointermove', (event) => {
      const rect = this.game.canvas.getBoundingClientRect();

      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;

      const scaleX = this.scale.width / rect.width;
      const scaleY = this.scale.height / rect.height;

      const pointerX = relativeX * scaleX;

      let newX = pointerX - this.paddleLayout.width / 2;
      newX = Phaser.Math.Clamp(newX, 0, this.scale.width - this.paddleLayout.width);

      this.paddle.setPosition(newX, this.paddleLayout.y);
      this.paddleLayout.x = newX;
    });

    this.input.keyboard?.on('keydown', (key: KeyboardEvent) => {
      if (key.code === 'KeyL') {
        this.isLogging = !this.isLogging;
      }
    });
  }

  addExtraLife() {
    if (this.lifesImages.length >= this.maxLifes) return;
    const lifeImg = this.add
      .image(
        this.baseUnit / 2 + this.lifesImages.length * (this.baseUnit + 10),
        this.baseUnit / 2,
        'life',
      )
      .setOrigin(0, 0)
      .setDisplaySize(this.baseUnit, this.baseUnit);
    this.lifesImages.push(lifeImg);
  }

  loseBall(ball: Ball) {
    this.balls = this.balls.filter((b) => b !== ball);
    ball.destroy();

    if (this.balls.length === 0) {
      this.cameras.main.shake(200, 0.01);
      this.cameras.main.flash(100, 255, 0, 0);
      this.lifesImages[this.lifesImages.length - 1].destroy();
      this.lifesImages.pop();

      if (this.lifesImages.length <= 0 && !this.isGameEnded) {
        this.isGameEnded = true;
        this.loseContainer = new LoseScreen(this);
      } else {
        this.balls.push(
          new Ball(this, this.cameras.main.centerX, this.cameras.main.centerY + this.baseUnit * 2),
        );
        this.bonuses.forEach((b) => b.destroy());
        this.explosiveBalls.forEach((b) => b.destroy());
        this.bonuses = [];
        this.explosiveBalls = [];
        this.isGameStarted = false;
        this.sound.play('click', { volume: 3 });
      }
    }
  }

  update(time: number, delta: number) {
    if (!this.isGameStarted) {
      return;
    }

    const numberOfBricks = this.brickRows * this.brickColumns;
    const brokenBricks = this.bricks.filter((brick) => !brick.isActive).length;

    this.message.setAlpha(brokenBricks / numberOfBricks);

    for (let i = 0; i < this.balls.length; i++) {
      this.balls[i].update(delta);
    }
    for (let i = 0; i < this.bonuses.length; i++) {
      this.bonuses[i].update(delta);
    }

    for (let i = 0; i < this.explosiveBalls.length; i++) {
      this.explosiveBalls[i].update(delta);
    }

    if (this.isLogging) {
      console.log(
        'FPS:',
        Math.round(this.game.loop.actualFps),
        '\n',
        'Tween count:',
        this.tweens.getTweens().length,
        '\n',
        'Display objects count:',
        this.children.list.length,
      );
    }
  }

  createPaddle(x?: number, y?: number) {
    const posX = x ?? this.paddleLayout.x;
    const posY = y ?? this.paddleLayout.y;

    const paddle = this.add.graphics();
    paddle.fillStyle(getColors('rgb(166, 183, 238)'), 1);
    paddle.fillRoundedRect(
      0,
      0,
      this.paddleLayout.width,
      this.paddleLayout.height,
      this.paddleLayout.height / 2,
    );

    paddle.setPosition(0, 0);
    this.face = this.add.image(this.paddleLayout.width / 2, this.paddleLayout.height / 2, 'idle');
    this.face.setDisplaySize(this.paddleLayout.height * 2, this.paddleLayout.height * 2);
    this.paddle = this.add.container(posX, posY, [paddle, this.face]).setDepth(2);
  }

  createBricks() {
    const levelPattern = bricksPattern.find((lp) => lp.level === this.level) as BricksPattern;

    if (!levelPattern) {
      return;
    }
    const margin = this.baseUnit / 16;
    const totalMarginX = (levelPattern.pattern[0].length - 1) * margin;

    const brickWidth = (this.scale.width - totalMarginX) / levelPattern.pattern[0].length;
    const brickHeight = brickWidth / 2;

    const offsetX =
      (this.scale.width - (brickWidth * levelPattern.pattern[0].length + totalMarginX)) / 2;
    const offsetY = this.baseUnit * this.offsetY;

    for (let row = 0; row < levelPattern.pattern.length; row++) {
      for (let col = 0; col < levelPattern.pattern[row].length; col++) {
        const level = levelPattern.pattern[row][col];
        if (level === 0) continue;
        const x = offsetX + col * (brickWidth + margin);
        const y = offsetY + row * (brickHeight + margin);

        const brick = new Brick(this, x, y, brickWidth, brickHeight, level, row, col);
        this.bricks.push(brick);
      }
    }
  }

  reset() {
    this.balls.forEach((b) => b.destroy());
    this.bonuses.forEach((b) => b.destroy());
    this.bricks.forEach((brick) => brick.destroy());
    this.lifesImages.forEach((life) => life.destroy());

    this.balls = [];
    this.bricks = [];
    this.bonuses = [];
    this.lifesImages = [];

    this.isGameStarted = false;
    this.isGameEnded = false;
    this.lifes = 1;

    this.balls.push(
      new Ball(this, this.cameras.main.centerX, this.cameras.main.centerY + this.baseUnit * 2),
    );

    this.createBricks();

    for (let i = 0; i < this.lifes; i++) {
      const lifeImg = this.add
        .image(this.baseUnit / 2 + i * (this.baseUnit + 10), this.baseUnit / 2, 'smile')
        .setOrigin(0, 0)
        .setDisplaySize(this.baseUnit, this.baseUnit);
      this.lifesImages.push(lifeImg);
    }

    this.paddle.setPosition(
      this.cameras.main.centerX - this.paddleLayout.width / 2,
      this.cameras.main.height - this.paddleLayout.height - this.baseUnit,
    );
    this.paddleLayout.x = this.paddle.x;

    this.sound.play('click', { volume: 3 });
    this.sound.play('music', { loop: true, volume: 0.1 });

    this.startScreenContainer = this.add.container(0, 0);
    const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5);
    overlay.setOrigin(0);
    const startText = this.add
      .text(this.cameras.main.centerX, this.cameras.main.centerY, 'Click pour commencer', {
        fontFamily: 'Josefinsans',
        fontSize: `${this.baseUnit * 1.2}px`,
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.startScreenContainer.add([overlay, startText]).setDepth(5);
  }
}

export function getColors(color: string): number {
  return Phaser.Display.Color.ValueToColor(color).color;
}
