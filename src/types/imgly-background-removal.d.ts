// Type declarations for @imgly/background-removal
// This module is optional - install with: npm install @imgly/background-removal

declare module '@imgly/background-removal' {
  export interface RemoveBackgroundConfig {
    model?: 'small' | 'medium' | 'large';
    output?: {
      format?: 'image/png' | 'image/jpeg' | 'image/webp';
      quality?: number;
    };
    progress?: (progress: number, message?: string) => void;
    debug?: boolean;
  }

  export function removeBackground(
    image: File | Blob | string,
    config?: RemoveBackgroundConfig
  ): Promise<Blob>;

  const _default: {
    removeBackground: typeof removeBackground;
  };
  export default _default;
}
