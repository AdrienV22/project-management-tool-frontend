import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes), // Inclure le RouterModule avec les routes
    AppComponent, // Importer AppComponent comme standalone component
  ],
  providers: [
    provideHttpClient(), // Fournir HttpClient
  ],
  bootstrap: [AppComponent], // Démarrage de l'application
})
export class AppConfig {}
