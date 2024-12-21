import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TaskComponent } from './components/task/task.component';

export const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'tasks', component: TaskComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' } // route par défaut
];
