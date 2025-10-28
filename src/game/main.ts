import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { LoadingScene } from './scenes/LoadingScene';

export function initPhaserGame() {
  window.splashStartTime = Date.now();

  const windowHeight = 2560;
  const windowWidth = 1440;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: windowWidth,
    height: windowHeight,
    backgroundColor: 'rgb(248, 237, 211)',
    antialias: false,
    pixelArt: false,
    roundPixels: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      zoom: 1,
    },
    parent: 'game-container',
    scene: [LoadingScene, MainScene],
    powerPreference: 'high-performance',
    autoMobilePipeline: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
  };

  new Phaser.Game(config);
}
