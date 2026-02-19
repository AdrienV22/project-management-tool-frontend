import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';
import { StatusFilterPipe } from '../../pipes/status-filter.pipe';

interface ProjectReference {
  id: number;
}

interface ExtendedTask extends Task {
  id?: number;
  project: ProjectReference; 
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusFilterPipe],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  projectMembers: any[] = [];

  newTask!: ExtendedTask;
  editingTask: Task | null = null;

  errorMessage = '';
  successMessage = '';

  selectedStatus = '';
  selectedTaskHistory: any[] = [];
  visibleHistoryTaskId: number | null = null;


  userId = 26;
  projectId = 26;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.resetMessages();
    this.resetNewTask();
    this.loadProjectMembers();
    this.loadTasks();
  }

  // Charge les tâches (back: GET /api/tasks + filtres optionnels)
  private loadTasks(): void {
    this.resetMessages();

    this.taskService
      .getTasks({
        projectId: this.projectId,
        status: this.selectedStatus || undefined,
      })
      .subscribe({
        next: (data) => {
          this.tasks = data ?? [];
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des tâches', error);
          this.errorMessage = 'Impossible de charger les tâches.';
        },
      });
  }

  onStatusFilterChange(): void {
    this.loadTasks();
  }

  // Placeholder UI (si tu as déjà la liste via ProjectService.getProjectMembers(projectId), on branchera dessus)
  private loadProjectMembers(): void {
    this.projectMembers = [
      { userId: this.userId, username: 'Moi', email: 'me@example.com', role: 'ADMIN' },
      { userId: 999, username: 'Alice', email: 'alice@example.com', role: 'MEMBRE' },
      { userId: 998, username: 'Bob', email: 'bob@example.com', role: 'OBSERVATEUR' },
    ];
  }

  // Création (back: POST /api/tasks) — payload conforme
  createTask(): void {
    this.resetMessages();

    // Si ton back impose min 5 caractères, on évite un 400 “bête”
    if (!this.newTask.title || this.newTask.title.trim().length < 5) {
      this.errorMessage = 'Le titre doit faire au moins 5 caractères.';
      return;
    }
    if (!this.newTask.description || this.newTask.description.trim().length < 5) {
      this.errorMessage = 'La description doit faire au moins 5 caractères.';
      return;
    }

    this.newTask.targetUserId = this.newTask.targetUserId || this.userId;
    this.newTask.project = { id: this.projectId };

    this.taskService.createTask(this.newTask).subscribe({
      next: (createdTask) => {
        // On recharge pour être certain d’être synchro (ids, tri, filtres, etc.)
        this.successMessage = 'Tâche créée avec succès !';
        this.resetNewTask();
        this.loadTasks();
      },
      error: (error) => {
        console.error('Erreur lors de la création de la tâche', error);
        this.errorMessage = 'Impossible de créer la tâche.';
      },
    });
  }

  // Édition : l’assignation se fait via targetUserId dans PUT /api/tasks/{id}
  startEditing(task: Task): void {
    this.resetMessages();

    // Copie “safe”
    this.editingTask = {
      ...task,
      // s’assure qu’on a bien le project.id pour l’update
      project: (task as any).project ?? { id: this.projectId },
    } as any;
  }

  cancelEditing(): void {
    this.editingTask = null;
    this.resetMessages();
  }

  // Update (back: PUT /api/tasks/{taskId})
  updateTask(): void {
    if (!this.editingTask?.id) return;

    this.resetMessages();

    // garde-fous d’intégration
    const payload: any = {
      ...this.editingTask,
      project: (this.editingTask as any).project ?? { id: this.projectId },
      targetUserId: (this.editingTask as any).targetUserId ?? this.userId,
    };

    this.taskService.updateTask(this.editingTask.id, payload).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex((t) => t.id === updatedTask.id);
        if (index !== -1) this.tasks[index] = updatedTask;

        this.successMessage = 'Tâche mise à jour avec succès.';
        this.editingTask = null;
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la tâche', error);
        this.errorMessage = 'Impossible de mettre à jour la tâche.';
      },
    });
  }

  // Delete (back: DELETE /api/tasks/{taskId})
  deleteTask(id: number): void {
    this.resetMessages();

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== id);
        this.successMessage = 'Tâche supprimée avec succès.';
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de la tâche', error);
        this.errorMessage = 'Impossible de supprimer la tâche.';
      },
    });
  }

  // Historique (back: GET /tasks/{taskId}/history)
  showHistory(taskId: number): void {
    this.resetMessages();

    if (this.visibleHistoryTaskId === taskId) {
      this.visibleHistoryTaskId = null;
      this.selectedTaskHistory = [];
      return;
    }

    this.taskService.getTaskHistory(taskId).subscribe({
      next: (history) => {
        this.selectedTaskHistory = history ?? [];
        this.visibleHistoryTaskId = taskId;
      },
      error: (error) => {
        console.error('Erreur historique', error);
        this.errorMessage = 'Impossible de récupérer l’historique.';
      },
    });
  }

  private resetNewTask(): void {
    this.newTask = {
      title: '',
      description: '',
      dueDate: null,
      status: 'En attente', // 
      priority: 'MOYENNE',  // BASSE | MOYENNE | HAUTE
      targetUserId: this.userId,
      project: { id: this.projectId },
    };
  }

  private resetMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }


  get editingTaskTitle(): string {
    return this.editingTask ? (this.editingTask as any).title : '';
  }

  get editingTaskDescription(): string {
    return this.editingTask ? (this.editingTask as any).description : '';
  }

  get editingTaskDueDate(): any {
    return this.editingTask ? (this.editingTask as any).dueDate : '';
  }

  get editingTaskPriority(): any {
    return this.editingTask ? (this.editingTask as any).priority : '';
  }

  get editingTaskStatus(): any {
    return this.editingTask ? (this.editingTask as any).status : '';
  }
}
