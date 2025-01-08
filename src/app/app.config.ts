import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser'; // Ajoute BrowserModule ici
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';

@NgModule({
  imports: [
    BrowserModule,  // Utilise BrowserModule pour les applications dans le navigateur
    CommonModule,
    RouterModule.forRoot(appRoutes), // Configure le routage
  ],
  providers: [
    provideHttpClient(), // Fournit HttpClient
  ],
  bootstrap: [AppComponent], // Démarrage de l'application
})
export class AppConfig {}
