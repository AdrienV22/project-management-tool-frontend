// src/app/app.config.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';  // Import de tes routes
import { provideHttpClient } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes), 
    // Pas besoin de HttpClientModule ici, on utilise provideHttpClient
  ],
  providers: [
    provideHttpClient()  // Fournit HttpClient sans HttpClientModule
  ],
  exports: [RouterModule],
})
export class AppConfig {}
