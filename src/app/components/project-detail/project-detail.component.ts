import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common'; // Pour *ngIf et autres directives Angular
import { FormsModule } from '@angular/forms'; // Pour [(ngModel)]

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  standalone: true, // Si votre composant est standalone
  imports: [CommonModule, FormsModule], // Ajout des modules requis
})
export class ProjectDetailComponent implements OnInit {
  project: any = {}; // Contient les détails du projet
  loading: boolean = true; // Indique si les données sont en cours de chargement
  error: string | null = null; // Message d'erreur à afficher
  isEditing: boolean = false; // Indique si l'utilisateur est en mode édition

  constructor(
    private route: ActivatedRoute, // Pour récupérer les paramètres de la route
    private router: Router, // Pour la navigation
    private projectService: ProjectService // Service pour gérer les projets
  ) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id'); // Récupère l'ID du projet dans l'URL
    if (projectId) {
      this.fetchProjectDetails(projectId); // Charge les détails du projet
    }
  }

  // Charge les détails d'un projet à partir de l'API
  fetchProjectDetails(id: string): void {
    this.loading = true; // Affiche le loader
    this.projectService.getProjectById(+id).subscribe(
      (data) => {
        this.project = data; // Charge les données du projet
        this.loading = false; // Cache le loader
      },
      (error) => {
        this.error = 'Erreur lors du chargement des détails du projet'; // Affiche un message d'erreur
        this.loading = false; // Cache le loader
      }
    );
  }

  // Active le mode édition
  enableEditMode(): void {
    this.isEditing = true; // Active le formulaire d'édition
  }

  // Désactive le mode édition et recharge les données originales
  cancelEditMode(): void {
    this.isEditing = false; // Désactive le mode édition
    this.fetchProjectDetails(this.project.id); // Recharge les données originales
  }

  // Met à jour le projet en appelant l'API
  updateProject(): void {
    this.loading = true; // Affiche un loader pendant la mise à jour
    this.projectService.updateProject(this.project.id, this.project).subscribe(
      (response) => {
        this.isEditing = false; // Désactive le mode édition
        this.fetchProjectDetails(this.project.id); // Recharge les données à jour
        this.loading = false; // Cache le loader
      },
      (error) => {
        this.error = 'Erreur lors de la mise à jour du projet'; // Affiche une erreur
        this.loading = false; // Cache le loader
      }
    );
  }

  // Confirme et supprime le projet
  confirmDelete(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      this.loading = true; // Affiche un loader pendant la suppression
      this.projectService.deleteProject(this.project.id).subscribe(
        () => {
          this.router.navigate(['/projects']); // Redirige vers la liste des projets après suppression
        },
        (error) => {
          this.error = 'Erreur lors de la suppression du projet'; // Affiche une erreur
          this.loading = false; // Cache le loader
        }
      );
    }
  }
}
