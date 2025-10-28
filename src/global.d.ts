// src/types/global.d.ts

interface Window {
	electron: {
			quitApp: () => void;
	};
	splashStartTime: number; 
}
