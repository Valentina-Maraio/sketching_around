import type { Editor as TldrawEditor } from '@tldraw/tldraw';

// Extend the Editor interface with subscribe
export interface Editor extends TldrawEditor {
  subscribe(callback: (store: any) => void): () => void;
  shapes: Record<string, any>;
  // A method to get the store data
  getStore: () => any;
}