import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Importer les composants standalone
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { TaskComponent } from './components/task/task.component';
import { HomeComponent } from './components/home/home.component';
import { TaskListComponent } from './components/task-list/task-list.component'

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,  // Importation de CommonModule pour *ngIf, *ngFor
    RouterModule.forRoot(appRoutes),  // Configuration des routes
    FormsModule,  // Importation de FormsModule pour les formulaires
    DragDropModule, // Module pour le drag & drop
    LoginComponent,
    RegisterComponent,
    ProjectsComponent,
    TaskComponent,
    HomeComponent,
    TaskListComponent,  // Ajout de TaskListComponent
  ],
  providers: [
    provideHttpClient(), // Fournit HttpClient
  ],
  bootstrap: [AppComponent],  // Bootstrap de l'application avec AppComponent
})
export class AppConfig {}
