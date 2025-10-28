import { useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { initPhaserGame } from './game/main';
import { Device } from '@capacitor/device';
import { StatusBar } from '@capacitor/status-bar';
import { AndroidFullScreen } from '@awesome-cordova-plugins/android-full-screen';

const App: React.FC = () => {
  let isGameLaunched = false;

  Device.getInfo().then((info) => {
    if (info.platform === 'android') {
      StatusBar.hide();
      AndroidFullScreen.immersiveMode();
    }
  });

  useEffect(() => {
    if (!isGameLaunched) {
      initPhaserGame();
      isGameLaunched = true;
    }
  }, [isGameLaunched]);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div id="game-container" className="game-container"></div>
        {/* <div id="splashScreen" className="splash-screen">
          <img id="splashScreenImg" src="./assets/splash.png" />
        </div> */}
      </IonContent>
    </IonPage>
  );
};

export default App;
