// entry point for client-side application
import { renderNav, setupRouting } from './ui.js';

// build basic layout
const app = document.getElementById('app');
app.prepend(renderNav());

// kick off router
setupRouting();
