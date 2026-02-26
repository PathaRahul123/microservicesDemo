import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="login-card">
        <div class="header">
          <h2>Sign In</h2>
          <p>Enter your credentials to continue</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <input type="email" formControlName="email" placeholder="Email">
          </div>
          
          <div class="form-group password-group">
            <input [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="Password">
            <span class="password-toggle" (click)="togglePassword()">
              <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </span>
          </div>

          <div class="actions">
            <label class="remember-me">
              <input type="checkbox"> Remember me
            </label>
            <a routerLink="/forgot-password" class="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" [disabled]="loginForm.invalid">Sign In</button>
        </form>

        <div class="footer">
          Don't have an account? <a routerLink="/register">Create one</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .login-card {
      background: white;
      width: 100%;
      max-width: 440px;
      padding: 40px 40px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      box-sizing: border-box;
      border: 1px solid #eaeaea;
    }
    .header {
      text-align: center;
      margin-bottom: 35px;
    }
    .header h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 10px 0 0 0;
      color: #6b7280;
      font-size: 15px;
    }
    .form-group {
      margin-bottom: 24px;
      position: relative;
    }
    input[type="email"],
    input[type="password"],
    input[type="text"] {
      width: 100%;
      padding: 14px 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      box-sizing: border-box;
      font-size: 15px;
      color: #374151;
      outline: none;
      transition: border-color 0.2s;
      background: white;
    }
    input::placeholder {
      color: #9ca3af;
    }
    input:focus {
      border-color: #3b82f6;
    }
    .password-toggle {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      color: #9ca3af;
      display: flex;
    }
    .password-toggle:hover {
      color: #6b7280;
    }
    .password-toggle svg {
      width: 20px;
      height: 20px;
    }
    .actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      font-size: 14px;
    }
    .remember-me {
      display: flex;
      align-items: center;
      color: #4b5563;
      cursor: pointer;
    }
    .remember-me input {
      margin-right: 8px;
      width: 16px;
      height: 16px;
      cursor: pointer;
      border: 1px solid #d1d5db;
      border-radius: 4px;
    }
    .forgot-link {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }
    .forgot-link:hover {
      text-decoration: underline;
    }
    button[type="submit"] {
      width: 100%;
      padding: 14px;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
    }
    button[type="submit"]:hover {
      background-color: #2563eb;
    }
    button[type="submit"]:disabled {
      background-color: #93c5fd;
      cursor: not-allowed;
      box-shadow: none;
    }
    .footer {
      text-align: center;
      margin-top: 28px;
      font-size: 14px;
      color: #6b7280;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
      margin-left: 4px;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          if (res.data && res.data.token) {
            localStorage.setItem('token', res.data.token);
            if (res.data.roles && res.data.roles.length > 0) {
              localStorage.setItem('role', res.data.roles[0]);
            } else if (res.data.role) {
              localStorage.setItem('role', res.data.role);
            }
            if (res.data.userId) localStorage.setItem('userId', res.data.userId.toString());

            const userRole = localStorage.getItem('role') || '';
            if (userRole.includes('ADMIN')) {
              this.router.navigate(['/admin/dashboard']);
            } else if (userRole.includes('BUSINESS')) {
              this.router.navigate(['/business/dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }
        },
        error: (err) => alert('Login failed: ' + (err.error?.message || 'Unknown error'))
      });
    }
  }
}
