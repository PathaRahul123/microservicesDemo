import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="page-container">
      <div class="login-card">
        <div class="header">
          <h2>{{ step === 1 ? 'Forgot Password' : 'Reset Password' }}</h2>
          <p>{{ step === 1 ? 'Enter your email to get your security question' : 'Answer the security question to reset your password' }}</p>
        </div>

        <!-- Step 1: Email Form -->
        <form *ngIf="step === 1" [formGroup]="emailForm" (ngSubmit)="getSecurityQuestion()">
          <div class="form-group">
            <input type="email" formControlName="email" placeholder="Email Address">
            <span class="error-text" *ngIf="emailForm.get('email')?.invalid && emailForm.get('email')?.touched">
              Please enter a valid email.
            </span>
          </div>
          <button type="submit" [disabled]="emailForm.invalid || loading">
            {{ loading ? 'Loading...' : 'Continue' }}
          </button>
        </form>

        <!-- Step 2: Reset Form -->
        <form *ngIf="step === 2" [formGroup]="resetForm" (ngSubmit)="resetPassword()">
          <div class="security-question-box">
            <p><strong>Security Question:</strong></p>
            <p>{{ securityQuestion }}</p>
          </div>

          <div class="form-group">
            <input type="text" formControlName="securityAnswer" placeholder="Your Answer">
          </div>

          <div class="form-group password-group">
            <input [type]="showPassword ? 'text' : 'password'" formControlName="newPassword" placeholder="New Password">
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

          <button type="submit" [disabled]="resetForm.invalid || loading">
            {{ loading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>

        <div class="footer">
          Remembered your password? <a routerLink="/login">Sign In</a>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .login-card { background: white; width: 100%; max-width: 440px; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); box-sizing: border-box; border: 1px solid #eaeaea; }
    .header { text-align: center; margin-bottom: 35px; }
    .header h2 { margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px; }
    .header p { margin: 10px 0 0 0; color: #6b7280; font-size: 15px; }
    .form-group { margin-bottom: 24px; position: relative; }
    .security-question-box { background: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 24px; color: #374151; font-size: 15px; border-left: 4px solid #3b82f6; }
    .security-question-box p { margin: 0; }
    input[type="email"], input[type="text"], input[type="password"] { width: 100%; padding: 14px 16px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; font-size: 15px; color: #374151; outline: none; transition: border-color 0.2s; background: white; }
    input:focus { border-color: #3b82f6; }
    .password-toggle { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #9ca3af; display: flex; }
    .password-toggle svg { width: 20px; height: 20px; }
    .error-text { color: #dc3545; font-size: 12px; margin-top: 5px; display: block; }
    button[type="submit"] { width: 100%; padding: 14px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; }
    button[type="submit"]:hover { background-color: #2563eb; }
    button[type="submit"]:disabled { background-color: #93c5fd; cursor: not-allowed; }
    .footer { text-align: center; margin-top: 28px; font-size: 14px; color: #6b7280; }
    .footer a { color: #3b82f6; text-decoration: none; font-weight: 500; margin-left: 4px; }
    .footer a:hover { text-decoration: underline; }
  `]
})
export class ForgotPasswordComponent {
    step = 1;
    loading = false;
    securityQuestion = '';
    showPassword = false;

    emailForm: FormGroup;
    resetForm: FormGroup;

    constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
        this.emailForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });

        this.resetForm = this.fb.group({
            securityAnswer: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(8)]]
        });
    }

    getSecurityQuestion() {
        if (this.emailForm.valid) {
            this.loading = true;
            const email = this.emailForm.value.email;
            this.authService.forgotPassword(email).subscribe({
                next: (res) => {
                    this.securityQuestion = res.data;
                    this.step = 2;
                    this.loading = false;
                },
                error: (err) => {
                    alert('Error: ' + (err.error?.message || 'Email not found.'));
                    this.loading = false;
                }
            });
        }
    }

    resetPassword() {
        if (this.resetForm.valid) {
            this.loading = true;
            const payload = {
                email: this.emailForm.value.email,
                securityAnswer: this.resetForm.value.securityAnswer,
                newPassword: this.resetForm.value.newPassword
            };

            this.authService.resetPassword(payload).subscribe({
                next: () => {
                    alert('Password reset successfully! You can now log in.');
                    this.router.navigate(['/login']);
                },
                error: (err) => {
                    alert('Failed to reset password: ' + (err.error?.message || 'Incorrect answer.'));
                    this.loading = false;
                }
            });
        }
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }
}
