import { getColors, MainScene } from './scenes/MainScene';

export class Ball extends Phaser.GameObjects.Graphics {
  mainScene: MainScene;
  baseSpeed: number = 300;
  ballSpeed: number = 300;
  ballRadius: number = 10;
  particleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter | undefined;
  ballTrailEmitter!: Phaser.GameObjects.Particles.ParticleEmitter | undefined;
  velocity: { x: number; y: number };

  constructor(scene: MainScene, x: number, y: number) {
    super(scene);
    this.mainScene = scene;

    this.mainScene.add.existing(this);
    this.ballSpeed = this.mainScene.baseUnit * 10;
    this.baseSpeed = this.mainScene.baseUnit * 10;
    this.velocity = { x: 0, y: 0.5 };
    this.ballRadius = this.mainScene.baseUnit / 4;
    this.createBall();
    this.setPosition(x, y);
    this.createParticleEmitter();
  }

  createBall() {
    this.fillStyle(getColors('rgb(252, 104, 67)'), 1);
    this.fillCircle(0, 0, this.ballRadius);
    this.setDepth(1);
  }

  update(delta: number) {
    this.x += this.velocity.x * (delta / 1000) * this.ballSpeed;
    this.y += this.velocity.y * (delta / 1000) * this.ballSpeed;

    this.checkCollisions();

    if (this.mainScene.bricks.every((brick) => !brick.isActive) && !this.mainScene.isGameEnded) {
      this.mainScene.isGameEnded = true;
      this.mainScene.sound.play('win');
      for (let i = 0; i < 500; i++) {
        const randomDelay = Phaser.Math.Between(0, 3000);
        this.mainScene.time.delayedCall(randomDelay, () => {
          const randomX = Phaser.Math.Between(0, this.mainScene.scale.width);
          const randomY = Phaser.Math.Between(0, this.mainScene.scale.height);
          this.particleEmitter?.explode(5, randomX, randomY);
        });
      }
    }
  }

  checkCollisions() {
    if (this.x <= this.ballRadius || this.x >= this.mainScene.scale.width - this.ballRadius) {
      this.velocity.x *= -1;
      this.ballBounce();
      return;
    }
    if (this.y <= this.ballRadius) {
      this.velocity.y *= -1;
      this.ballBounce();
      return;
    }
    if (this.y >= this.mainScene.scale.height + this.ballRadius) {
      this.mainScene.loseBall(this);
    }
    if (
      this.y + this.ballRadius >= this.mainScene.paddleLayout.y &&
      this.x + this.ballRadius > this.mainScene.paddleLayout.x &&
      this.x - this.ballRadius <
        this.mainScene.paddleLayout.x + this.mainScene.paddleLayout.width &&
      this.velocity.y > 0
    ) {
      this.y = this.mainScene.paddleLayout.y - this.ballRadius;

      const impactPosition =
        (this.x - (this.mainScene.paddleLayout.x + this.mainScene.paddleLayout.width / 2)) /
        (this.mainScene.paddleLayout.width / 2);

      const bounceAngle = impactPosition * (Math.PI / 3);

      this.velocity.x = Math.sin(bounceAngle);
      this.velocity.y = -Math.cos(bounceAngle);
      this.ballBounce();
      this.mainScene.face.setTexture('smile');
      this.mainScene.sound.play('bounce');

      if (!this.mainScene.isPaddleTweening) {
        this.mainScene.isPaddleTweening = true;
        this.mainScene.add.tween({
          targets: this.mainScene.paddle,
          scaleY: 1.5,
          y: this.mainScene.paddle.y - this.mainScene.paddleLayout.height / 4,
          duration: 150,
          ease: 'Power1',
          yoyo: true,
          onComplete: () => {
            this.mainScene.face.setTexture('idle');
            this.mainScene.paddle.setScale(1);
            this.mainScene.isPaddleTweening = false;
          },
        });
      }

      return;
    }
    for (let i = this.mainScene.bricks.length - 1; i >= 0; i--) {
      const brick = this.mainScene.bricks[i];
      if (!brick.isActive) continue;

      const dx = this.x - Phaser.Math.Clamp(this.x, brick.x, brick.x + brick.width);
      const dy = this.y - Phaser.Math.Clamp(this.y, brick.y, brick.y + brick.height);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.ballRadius) {
        const overlapX =
          this.ballRadius - Math.abs(this.x - (brick.x + brick.width / 2)) + brick.width / 2;
        const overlapY =
          this.ballRadius - Math.abs(this.y - (brick.y + brick.height / 2)) + brick.height / 2;

        if (overlapX < overlapY) {
          this.velocity.x *= -1;
        } else {
          this.velocity.y *= -1;
        }

        this.ballBounce();
        brick.onHit();
        break;
      }
    }
  }

  ballBounce() {
    this.mainScene.sound.play('ballBounce', { volume: 0.2 });
    this.particleEmitter?.explode(10, this.x, this.y);
    this.setScale(2);
    this.mainScene.add.tween({
      targets: this,
      scale: 1,
      duration: 100,
      ease: 'Power1',
      onComplete: () => {
        this.setScale(1);
      },
    });
  }

  createParticleEmitter() {
    const size = this.ballRadius;
    const graphics = this.mainScene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(getColors('rgb(255, 255, 255)'), 1);
    graphics.fillCircle(size, size, size);
    graphics.generateTexture('spark', size * 2, size * 2);
    graphics.destroy();

    const particles = this.mainScene.add.particles(0, 0, 'spark', {
      emitting: false,
      lifespan: 600,
      speed: { min: 1 * this.ballSpeed, max: (1 * this.ballSpeed) / 5 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      gravityY: (300 * this.mainScene.baseUnit) / 32,
      tint: [
        Phaser.Display.Color.HSLToColor(0.1, 0.85, 0.65).color,
        Phaser.Display.Color.HSLToColor(0.2, 0.85, 0.65).color,
        Phaser.Display.Color.HSLToColor(0.3, 0.85, 0.65).color,
        Phaser.Display.Color.HSLToColor(0.4, 0.85, 0.65).color,
        Phaser.Display.Color.HSLToColor(0.5, 0.85, 0.65).color,
        Phaser.Display.Color.HSLToColor(0.6, 0.85, 0.65).color,
        Phaser.Display.Color.HSLToColor(0.7, 0.85, 0.65).color,
        Phaser.Display.Color.HSLToColor(0.8, 0.85, 0.65).color,
        Phaser.Display.Color.HSLToColor(0.9, 0.85, 0.65).color,
      ],
      quantity: 10,
    });

    this.particleEmitter = particles;

    const trailParticles = this.mainScene.add.particles(0, 0, 'spark', {
      follow: this,
      emitting: true,
      lifespan: 600,
      frequency: 30,
      speed: { min: 0, max: 20 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.4, end: 0 },
      tint: [
        getColors('rgb(252, 104, 67)'),
        getColors('rgb(236, 181, 85)'),
        getColors('rgb(226, 106, 106)'),
      ],
    });
    this.ballTrailEmitter = trailParticles;
  }

  destroy() {
    this.particleEmitter?.destroy();
    this.particleEmitter = undefined;
    this.ballTrailEmitter?.destroy();
    this.ballTrailEmitter = undefined;
    super.destroy();
  }
}
