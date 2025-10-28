import { Brick } from './Brick';
import { getColors, MainScene } from './scenes/MainScene';

export class ExplosiveBall extends Phaser.GameObjects.Graphics {
  mainScene: MainScene;
  baseSpeed: number = 300;
  ballSpeed: number = 300;
  ballRadius: number = 10;
  particleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter | undefined;
  ballTrailEmitter!: Phaser.GameObjects.Particles.ParticleEmitter | undefined;
  velocity: { x: number; y: number } = { x: 0, y: 0 };
  isActive: boolean = true;

  constructor(mainScene: MainScene, x: number, y: number) {
    super(mainScene);
    this.mainScene = mainScene;
    this.mainScene.add.existing(this);
    this.ballSpeed = this.mainScene.baseUnit * 10;
    this.baseSpeed = this.mainScene.baseUnit * 10;
    this.velocity = { x: 0, y: -1 };
    this.ballRadius = this.mainScene.baseUnit / 2;
    this.createBall();
    this.setPosition(x, y);
    this.createParticleEmitter();
  }

  update(delta: number) {
    if (this.isActive === false) {
      return;
    }
    this.x += this.velocity.x * (delta / 1000) * this.ballSpeed;
    this.y += this.velocity.y * (delta / 1000) * this.ballSpeed;

    this.checkCollisions();
  }

  createBall() {
    this.fillStyle(getColors('rgb(252, 104, 67)'), 1);
    this.fillCircle(0, 0, this.ballRadius);
    this.setDepth(1);
  }

  createParticleEmitter() {
    const size = this.ballRadius * 2;
    const graphics = this.mainScene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(getColors('rgb(255, 255, 255)'), 1);
    graphics.fillCircle(size, size, size);
    graphics.generateTexture('explosiveSpark', size * 2, size * 2);
    graphics.destroy();

    const particles = this.mainScene.add.particles(0, 0, 'explosiveSpark', {
      emitting: false,
      lifespan: 600,
      speed: {
        min: (-100 * this.mainScene.baseUnit) / 8,
        max: (100 * this.mainScene.baseUnit) / 8,
      },
      scale: { start: 1, end: 0.1 },
      alpha: { start: 1, end: 0 },
      tint: [
        getColors('rgb(252, 104, 67)'),
        getColors('rgb(236, 181, 85)'),
        getColors('rgb(226, 106, 106)'),
        getColors('rgb(255, 120, 100)'),
        getColors('rgb(255, 255, 255)'),
        getColors('rgb(255, 200, 80)'),
      ],
      gravityY: (300 * this.mainScene.baseUnit) / 32,
    });

    this.particleEmitter = particles;

    const trailParticles = this.mainScene.add
      .particles(0, 0, 'spark', {
        follow: this,
        emitting: true,
        lifespan: 600,
        frequency: 30,
        speed: {
          min: (-30 * this.mainScene.baseUnit) / 8,
          max: (30 * this.mainScene.baseUnit) / 8,
        },
        scale: { start: 1.2, end: 0 },
        alpha: { start: 0.4, end: 0 },
        tint: [
          getColors('rgb(252, 104, 67)'),
          getColors('rgb(236, 181, 85)'),
          getColors('rgb(226, 106, 106)'),
          getColors('rgb(255, 120, 100)'),
          getColors('rgb(255, 200, 80)'),
        ],
      })
      .setDepth(3);
    this.ballTrailEmitter = trailParticles;
  }

  checkCollisions() {
    if (this.y <= 0 + this.ballRadius) {
      this.destroy();
    }

    for (let i = this.mainScene.bricks.length - 1; i >= 0; i--) {
      const brick = this.mainScene.bricks[i];
      if (!brick.isActive) continue;

      const dx = this.x - Phaser.Math.Clamp(this.x, brick.x, brick.x + brick.width);
      const dy = this.y - Phaser.Math.Clamp(this.y, brick.y, brick.y + brick.height);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.ballRadius) {
        this.isActive = false;
        this.particleEmitter?.explode(30, this.x, this.y);
        const neighbors = this.getNeighbors(brick);
        neighbors.push(brick);
        neighbors.forEach((neighbor) => {
          neighbor.onHit(99);
        });
        this.clear();
        this.ballTrailEmitter?.stop();
        this.mainScene.cameras.main.shake(50, 0.02);
        this.mainScene.time.delayedCall(600, () => {
          this.destroy();
        });
        return;
      }
    }
  }

  getNeighbors(brick: Brick) {
    const r = brick.row;
    const c = brick.column;

    return this.mainScene.bricks.filter(
      (b) =>
        b.isActive &&
        ((b.row === r && b.column === c - 1) ||
          (b.row === r && b.column === c + 1) ||
          (b.column === c && b.row === r - 1) ||
          (b.column === c && b.row === r + 1)),
    );
  }

  destroy() {
    this.mainScene.explosiveBalls = this.mainScene.explosiveBalls.filter((b) => b !== this);
    this.particleEmitter?.destroy();
    this.particleEmitter = undefined;
    this.ballTrailEmitter?.destroy();
    this.ballTrailEmitter = undefined;
    super.destroy();
  }
}
