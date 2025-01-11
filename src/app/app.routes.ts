// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';
import { HomeComponent } from './components/home/home.component';
import { TaskComponent } from './components/task/task.component';
import { AuthGuard } from './services/auth.guard'; // Import du guard

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] },
  { path: 'projects/:id', component: ProjectDetailComponent, canActivate: [AuthGuard] },
  { path: 'tasks/:id', component: TaskComponent, canActivate: [AuthGuard] },
  { path: 'tasks', component: TaskComponent, canActivate: [AuthGuard] }, // Affiche toutes les tâches
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },  // Affiche une tâche spécifique
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirection par défaut vers login
  { path: '**', redirectTo: '/login' }, // Route de secours vers login
];
