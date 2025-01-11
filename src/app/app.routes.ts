import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';
import { HomeComponent } from './components/home/home.component';
import { TaskComponent } from './components/task/task.component';
import { AuthGuard } from './services/auth.guard'; 

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] }, // Applique le guard ici
  { path: 'projects/:id', component: ProjectDetailComponent, canActivate: [AuthGuard] },
  { path: 'tasks/:id', component: TaskComponent, canActivate: [AuthGuard] },
  { path: 'tasks', component: TaskComponent, canActivate: [AuthGuard] }, // Applique le guard ici
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
