// src/app/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/tasks';  // URL de notre API backend

  constructor(private http: HttpClient) { }

  // Méthode pour récupérer toutes les tâches
  getTasks(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Méthode pour créer une nouvelle tâche
  createTask(task: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, task);
  }
}
