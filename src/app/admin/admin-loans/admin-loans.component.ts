import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-loans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="loans-container">
      <h2>Loan Applications Management</h2>
      <p>Review and approve pending user and business loans.</p>

      @if (loading) {
        <p>Loading loans...</p>
      }

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }

      <div class="table-container" *ngIf="loans.length > 0">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Applicant ID</th>
              <th>Amount</th>
              <th>Tenure</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let loan of loans">
              <td>#{{ loan.loanId }}</td>
              <td>{{ loan.applicantName }} (ID: {{ loan.userId }})</td>
              <td>₹{{ loan.amount }}</td>
              <td>{{ loan.tenureMonths }} mos</td>
              <td>{{ loan.purpose }}</td>
              <td><span class="badge" [ngClass]="loan.status">{{ loan.status }}</span></td>
              <td class="action-cell">
                <div *ngIf="loan.status === 'PENDING' || loan.status === 'APPLIED'" class="approval-form">
                  <span style="font-size: 13px; color: #555; white-space: nowrap;">Interest Rate (%):</span>
                  <input type="number" [(ngModel)]="loan.proposedRate" placeholder="Rate %" class="rate-input" step="0.1" style="margin-left: 5px; margin-right: 5px;">
                  <button class="btn btn-success btn-sm" (click)="processLoan(loan, true)">Approve</button>
                  <button class="btn btn-danger btn-sm" (click)="processLoan(loan, false)">Reject</button>
                </div>
                <span *ngIf="loan.status === 'APPROVED'">Approved at {{ loan.interestRate }}%</span>
                <span *ngIf="loan.status === 'REJECTED'">Rejected</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Basic Pagination -->
        <div class="pagination">
          <button [disabled]="currentPage === 0" (click)="prevPage()" class="btn btn-secondary">Previous</button>
          <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
          <button [disabled]="currentPage >= totalPages - 1" (click)="nextPage()" class="btn btn-secondary">Next</button>
        </div>
      </div>

      <div *ngIf="!loading && loans.length === 0" class="no-data">
        <p>No system loans found.</p>
      </div>
    </div>
  `,
  styles: [`
    .loans-container { padding: 20px; }
    h2 { color: #333; margin-bottom: 10px; }
    
    .table-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 20px; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .table th { background-color: #f8f9fa; color: #495057; font-weight: 600; }
    
    .badge { padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .PENDING { background-color: #ffeeba; color: #856404; }
    .APPROVED { background-color: #d4edda; color: #155724; }
    .REJECTED { background-color: #f8d7da; color: #721c24; }

    .action-cell { min-width: 250px; }
    .approval-form { display: flex; gap: 5px; align-items: center; }
    .rate-input { width: 70px; padding: 5px; border: 1px solid #ccc; border-radius: 4px; }
    
    .btn { padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; color: white; }
    .btn-sm { padding: 4px 8px; font-size: 12px; }
    .btn-success { background-color: #28a745; }
    .btn-danger { background-color: #dc3545; }
    .btn-secondary { background-color: #6c757d; }
    .btn:hover { opacity: 0.9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .alert-danger { background-color: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
    .pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
    .no-data { background: white; padding: 30px; text-align: center; border-radius: 8px; margin-top: 20px; color: #6c757d; }
  `]
})
export class AdminLoansComponent implements OnInit {
  loans: any[] = [];
  loading = false;
  error = '';

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans(page: number = 0) {
    this.loading = true;
    this.error = '';
    this.currentPage = page;

    this.adminService.getAllLoans(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.loans = res.data.content;
          // Set default prop rate to 8.5% for ease of use
          this.loans.forEach(loan => {
            if (loan.status === 'PENDING' || loan.status === 'APPLIED') loan.proposedRate = 8.5;
          });
          this.totalPages = res.data.totalPages;
        } else {
          this.error = res.message || 'Failed to load loans';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error communicating with server';
        this.loading = false;
      }
    });
  }

  processLoan(loan: any, isApproved: boolean) {
    const payload: any = {
      loanId: loan.loanId,
      approved: isApproved
    };

    if (isApproved) {
      if (!loan.proposedRate || loan.proposedRate <= 0) {
        alert("Please provide a valid interest rate to approve the loan.");
        return;
      }
      payload.approvedInterestRate = loan.proposedRate;
    } else {
      payload.rejectionReason = "Admin rejected the application.";
    }

    this.adminService.approveLoan(payload).subscribe({
      next: (res) => {
        if (res.success) {
          alert(`Loan successfully ${isApproved ? 'approved' : 'rejected'}.`);
          this.loadLoans(this.currentPage);
        } else {
          alert("Error: " + res.message);
        }
      },
      error: (err) => alert("Failed to process loan: " + (err.error?.message || 'Unknown error'))
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.loadLoans(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.loadLoans(this.currentPage - 1);
    }
  }
}
