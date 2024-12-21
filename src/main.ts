// src/main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app/app.routes';

platformBrowserDynamic()
  .bootstrapModule(AppComponent, {
    providers: [
      importProvidersFrom(
        BrowserModule, 
        RouterModule.forRoot(appRoutes)
      ),
    ]
  })
  .catch(err => console.error(err));
