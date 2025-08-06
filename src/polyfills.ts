// src/polyfills.ts
if (typeof MessageChannel === 'undefined') {
  global.MessageChannel = class MessageChannel {
    port1: any;
    port2: any;
    
    constructor() {
      this.port1 = {
        postMessage: () => {},
        onmessage: null,
        addEventListener: () => {},
        removeEventListener: () => {}
      };
      this.port2 = {
        postMessage: () => {},
        onmessage: null,
        addEventListener: () => {},
        removeEventListener: () => {}
      };
    }
  };
}