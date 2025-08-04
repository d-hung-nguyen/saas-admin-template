// Polyfill MessageChannel for Cloudflare Workers runtime
// This must be done BEFORE any imports that might use it
if (typeof MessageChannel === "undefined") {
  globalThis.MessageChannel = class {
    constructor() {
      this.port1 = {
        postMessage: () => {},
        onmessage: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        start: () => {},
        close: () => {},
      }
      this.port2 = {
        postMessage: () => {},
        onmessage: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        start: () => {},
        close: () => {},
      }
    }
  }
}

// This is a wrapper file for exporting both the Astro application as well as
// the CustomerWorkflow class. This is necessary because Astro does not allow
// us to manually export non-Astro stuff as part of the bundle file.
import astroEntry, { pageMap } from "./_worker.js/index.js"
import { CustomerWorkflow } from "../src/workflows/customer_workflow.js"

export default astroEntry
export { CustomerWorkflow, pageMap }
