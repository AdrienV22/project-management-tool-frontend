import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

import { AuthService } from './services/auth.service';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule, CommonModule],
})
export class AppComponent {
  isLoggedIn$: Observable<boolean>;
  userEmail$: Observable<string | null>;
  userRole$: Observable<string | null>;

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn$ = this.authService.getAuthStatus();
    this.userEmail$ = this.authService.getUserEmail();
    this.userRole$ = this.authService.getUserRole();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
