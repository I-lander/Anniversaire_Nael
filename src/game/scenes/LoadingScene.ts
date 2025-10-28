export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload() {
    this.load.image('smile', './assets/images/smile.png');
    this.load.image('idle', './assets/images/idle.png');
    this.load.image('message', './assets/images/message.png');
    this.load.image('life', './assets/images/life.png');

    this.load.image('expandPaddle', './assets/images/expandPaddle.png');
    this.load.image('shrinkPaddle', './assets/images/shrinkPaddle.png');
    this.load.image('extraLife', './assets/images/extraLife.png');
    this.load.image('multiBall', './assets/images/multiBall.png');
    this.load.image('slowBall', './assets/images/slowBall.png');
    this.load.image('fastBall', './assets/images/fastBall.png');

    this.load.audio('click', './assets/audio/click.m4a');
    this.load.audio('bounce', './assets/audio/bounce.m4a');
    this.load.audio('break', './assets/audio/break.m4a');
    this.load.audio('win', './assets/audio/win.m4a');
    this.load.audio('ballBounce', './assets/audio/ballBounce.m4a');
    this.load.audio('music', './assets/audio/music.mp3');

    document.fonts.load('16px "Josefinsans"').then(() => {});
  }

  async create() {
    this.scene.start('MainScene');

    this.scale.refresh();
  }
}
