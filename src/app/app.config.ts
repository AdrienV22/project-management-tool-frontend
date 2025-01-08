// src/app/app.config.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';  // Import des routes
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { TaskComponent } from './components/task/task.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent, // Déclarer les composants ici
    TaskComponent, // Déclarer les composants ici
  ],
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [
    provideHttpClient()  // Fournit HttpClient
  ],
  bootstrap: [AppComponent],
})
export class AppConfig {}
