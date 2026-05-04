export interface FlowerPreset {
  name: string;
  c1: [number, number, number];
  c2: [number, number, number];
  c3: [number, number, number];
  stemC: [number, number, number];
  layers: number;
  petalsPerLayer: number;
  maxRadius: number;
  ruffleAmt: number;
  sepals: number;
}

export interface SketchParams {
  flowerIndex: number;
  bloomSpeed: number;
  wiltSpeed: number;
  interactiveDuration: number;
  modeCycleInterval: number;
  forcedRenderMode: 'auto' | 'ascii' | 'dots' | 'pixels' | 'raw';
  densityMin: number;
  densityMax: number;
  autoRotate: boolean;
  rotationSpeed: number;
  mouseInfluence: number;
  glitchEnabled: boolean;
  glitchFrequency: number;
  glitchIntensity: number;
  asciiCharSet: 'letters' | 'binary' | 'symbols' | 'blocks';
  bgColor: [number, number, number];
  paused: boolean;
  hideUI: boolean;
  customColors: {
    c1: [number, number, number];
    c2: [number, number, number];
    c3: [number, number, number];
    stemC: [number, number, number];
  } | null;
}
