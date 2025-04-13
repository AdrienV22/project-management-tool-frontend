import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  standalone: true, 
  imports: [CommonModule, FormsModule], 
})
export class ProjectDetailComponent implements OnInit {
  project: any = {};
  loading: boolean = true;
  error: string | null = null; 
  isEditing: boolean = false;

  inviteEmail: string = '';
  inviteRole: string = 'MEMBRE';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  // Initialise le composant en chargeant les détails du projet depuis l'URL
  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.fetchProjectDetails(projectId);
    }
  }

  // Récupère les détails d'un projet via le service
  fetchProjectDetails(id: string): void {
    this.loading = true;
    this.projectService.getProjectById(+id).subscribe(
      (data) => {
        this.project = data;
        this.loading = false;
      },
      (error) => {
        this.error = 'Erreur lors du chargement du projet';
        this.loading = false;
      }
    );
  }

  // Active le mode édition pour modifier le projet
  enableEditMode(): void {
    this.isEditing = true;
  }

  // Annule le mode édition et recharge les données du projet
  cancelEditMode(): void {
    this.isEditing = false;
    this.fetchProjectDetails(this.project.id);
  }

  // Envoie les modifications du projet au backend
  updateProject(): void {
    this.loading = true;

    const updatedProject = {
      ...this.project,
      statut: this.project.statut || 'Non défini',
      clientEmail: this.project.clientEmail || 'Inconnu',
    };

    this.projectService.updateProject(this.project.id, updatedProject).subscribe(
      () => {
        this.isEditing = false;
        this.fetchProjectDetails(this.project.id);
        this.loading = false;
      },
      () => {
        this.error = 'Erreur lors de la mise à jour';
        this.loading = false;
      }
    );
  }

  // Supprime un projet après confirmation de l'utilisateur
  confirmDelete(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      this.loading = true;
      this.projectService.deleteProject(this.project.id).subscribe(
        () => {
          this.router.navigate(['/projects']);
        },
        () => {
          this.error = 'Erreur lors de la suppression';
          this.loading = false;
        }
      );
    }
  }

  // Envoie une invitation à un membre pour rejoindre le projet
  inviteMember(): void {
    if (!this.project || !this.project.id || !this.inviteEmail || !this.inviteRole) return;

    this.projectService
      .addUserToProject(this.project.id, this.inviteEmail, this.inviteRole)
      .subscribe({
        next: () => {
          console.log('Membre invité avec succès');
          this.inviteEmail = '';
          this.inviteRole = 'MEMBRE';
        },
        error: () => {
          console.error('Erreur lors de l’invitation');
        }
      });
  }
}
