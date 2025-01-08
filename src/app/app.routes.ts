import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TaskComponent } from './components/task/task.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'projects/:id', component: ProjectDetailComponent },
  { path: 'tasks/:id', component: TaskComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirection par défaut vers la page de login
  { path: '**', redirectTo: '/login', pathMatch: 'full' } // Gestion des routes inconnues
];
