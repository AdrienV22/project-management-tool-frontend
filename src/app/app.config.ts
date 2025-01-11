import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';  // Assurez-vous d'importer FormsModule

// Importer les composants standalone
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { TaskComponent } from './components/task/task.component';
import { HomeComponent } from './components/home/home.component';

@NgModule({
  imports: [
    BrowserModule,  // Utilise BrowserModule pour les applications dans le navigateur
    CommonModule,
    RouterModule.forRoot(appRoutes), // Configure le routage
    FormsModule,  // Assure-toi que FormsModule est bien inclus ici
    AppComponent,   // Importer le composant sans le déclarer
    LoginComponent,
    RegisterComponent,
    ProjectsComponent,
    TaskComponent,
    HomeComponent,
  ],
  providers: [
    provideHttpClient(), // Fournit HttpClient
  ],
  bootstrap: [AppComponent], // Démarrage de l'application
})
export class AppConfig {}
