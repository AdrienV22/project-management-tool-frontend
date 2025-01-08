import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppConfig } from './app/app.config'; // Import correct du module principal

platformBrowserDynamic()
  .bootstrapModule(AppConfig) // Bootstraper AppConfig, pas AppComponent
  .catch(err => console.error(err));
