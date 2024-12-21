// src/app/app.config.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';  // Import de tes routes
import { HttpClientModule } from '@angular/common/http';  // Import d'HttpClientModule pour effectuer des appels HTTP

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes), // Ajout des routes ici
    HttpClientModule,  // Ajout du module HttpClient pour permettre les requêtes HTTP
  ],
  providers: [],  // Liste des services que tu peux injecter
  exports: [RouterModule],  // Exportation de RouterModule pour qu'il soit disponible dans le reste de l'application
})
export class AppConfig {}
