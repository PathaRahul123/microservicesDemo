import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-business-layout',
    standalone: true,
    imports: [RouterLink, RouterOutlet],
    template: `
    <div class="business-container">
      <nav class="sidebar">
        <h2 style="color: white; text-align: center;">Business Hub</h2>
        <ul>
          <li><a routerLink="/business/dashboard" routerLinkActive="active">Dashboard</a></li>
          <li><a routerLink="/business/invoices" routerLinkActive="active">Invoices</a></li>
          <li><a routerLink="/business/loans" routerLinkActive="active">Loans</a></li>
          <li style="margin-top: auto;"><button class="logout-btn" (click)="logout()">Logout</button></li>
        </ul>
      </nav>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
    styles: [`
    .business-container { display: flex; height: 100vh; background: #f8f9fa; }
    .sidebar { width: 250px; background: #004d99; padding-top: 20px; color: white; display: flex; flex-direction: column; }
    ul { list-style: none; padding: 0; display: flex; flex-direction: column; height: 100%; margin: 0; }
    li { margin-bottom: 5px; }
    a { display: block; padding: 15px 20px; color: white; text-decoration: none; font-size: 16px; border-left: 4px solid transparent; }
    a:hover { background: #003366; }
    a.active { background: #003366; border-left-color: #ffc107; font-weight: bold; }
    .content { flex: 1; padding: 30px; overflow-y: auto; }
    .logout-btn { display: block; width: 100%; padding: 15px; background: #cc0000; color: white; text-align: center; border: none; cursor: pointer; font-size: 16px; margin-top: 10px; }
    .logout-btn:hover { background: #990000; }
  `]
})
export class BusinessLayoutComponent {
    constructor(private authService: AuthService, private router: Router) { }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
