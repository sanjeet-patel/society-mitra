declare module "threejs-components/build/cursors/tubes1.min.js" {
  interface TubesCursorOptions {
    tubes?: {
      colors?: string[];
      lights?: {
        intensity?: number;
        colors?: string[];
      };
    };
    bloom?: {
      threshold?: number;
      strength?: number;
      radius?: number;
    };
  }

  interface TubesCursorApp {
    dispose: () => void;
    tubes: {
      setColors: (colors: string[]) => void;
      setLightsColors: (colors: string[]) => void;
    };
  }

  export default function TubesCursor(
    canvas: HTMLCanvasElement,
    options?: TubesCursorOptions
  ): TubesCursorApp;
}
