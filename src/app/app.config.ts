import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { TaskComponent } from './components/task/task.component';
import { HomeComponent } from './components/home/home.component';
import { provideHttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ProjectsComponent,
    TaskComponent,
    HomeComponent // Déclarer ici ton HomeComponent
  ],
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
