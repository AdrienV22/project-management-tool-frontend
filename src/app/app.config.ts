// src/app/app.config.ts
import { InjectionToken, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(appRoutes)],  // Importation des modules nécessaires
  providers: [], // Liste des services à injecter
  exports: [RouterModule]  // Export du module de routage pour qu'il soit utilisé partout
})
export class AppConfig {}
