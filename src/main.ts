// src/main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppComponent } from './app/app.component';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app/app.routes';

platformBrowserDynamic()
  .bootstrapModule(AppComponent)
  .catch(err => console.error(err));
