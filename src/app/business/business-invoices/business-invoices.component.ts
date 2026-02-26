import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InvoiceService, InvoiceDTO } from '../invoice.service';
import { BusinessProfileService } from '../business-profile.service';

@Component({
  selector: 'app-business-invoices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="header">
      <h2>Invoice Management</h2>
      @if (isVerified) {
        <button class="btn-primary" (click)="showCreateForm = !showCreateForm">
          {{ showCreateForm ? 'Cancel' : 'Create Invoice' }}
        </button>
      }
    </div>

    @if (!isVerified) {
      <div class="alert alert-warning">
        Your business profile is currently pending Admin approval or is suspended. You cannot manage invoices at this time.
      </div>
    } @else {
      
      @if (showCreateForm) {
        <div class="create-form-container">
          <h3>New Invoice</h3>
          <form [formGroup]="invoiceForm" (ngSubmit)="createInvoice()">
            <div class="form-row">
              <div class="form-group"><label>Customer Name</label><input type="text" formControlName="customerName"></div>
              <div class="form-group"><label>Customer Email</label><input type="email" formControlName="customerEmail"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Total Amount (₹)</label><input type="number" formControlName="totalAmount" step="0.01"></div>
              <div class="form-group"><label>Due Date</label><input type="date" formControlName="dueDate"></div>
            </div>
            <button type="submit" class="btn-success" [disabled]="invoiceForm.invalid">Save Invoice</button>
          </form>
        </div>
      }

      <div class="table-container">
        @if (invoices.length === 0) {
          <p>No invoices found. Generate one to get started!</p>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (inv of invoices; track inv.id) {
                <tr>
                  <td>#{{ inv.id }}</td>
                  <td>{{ inv.customerName }}<br><small>{{ inv.customerEmail }}</small></td>
                  <td>₹{{ inv.totalAmount }}</td>
                  <td>{{ inv.dueDate }}</td>
                  <td><span class="badge" [ngClass]="inv.status">{{ inv.status }}</span></td>
                  <td class="actions">
                    @if (inv.status === 'DRAFT') {
                      <button class="btn-sm btn-info" (click)="sendInvoice(inv.id)">Send</button>
                    }
                    @if (inv.status === 'SENT' || inv.status === 'OVERDUE') {
                      <button class="btn-sm btn-success" (click)="markPaid(inv.id)">Mark Paid</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
          
          <!-- Basic Pagination -->
          <div class="pagination">
            <button [disabled]="currentPage === 0" (click)="loadInvoices(currentPage - 1)">Previous</button>
            <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
            <button [disabled]="currentPage >= totalPages - 1" (click)="loadInvoices(currentPage + 1)">Next</button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-primary { background: #0d6efd; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    .btn-primary:hover { background: #0b5ed7; }
    .btn-success { background: #198754; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    .btn-success:hover { background: #157347; }
    .btn-success:disabled { background: #ccc; cursor: not-allowed; }
    .btn-info { background: #0dcaf0; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; }
    .btn-info:hover { background: #31d2f2; }
    .btn-sm { font-size: 12px; margin-right: 5px; }
    
    .alert-warning { background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; border: 1px solid #ffeeba; margin-bottom: 20px; }
    
    .create-form-container { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd; }
    .form-row { display: flex; gap: 15px; margin-bottom: 15px; }
    .form-group { flex: 1; display: flex; flex-direction: column; }
    .form-group label { margin-bottom: 5px; font-weight: bold; font-size: 14px; color: #333; }
    .form-group input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    
    .table-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    .data-table th { background: #f8f9fa; font-weight: bold; color: #333; }
    .data-table small { color: #888; }
    
    .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
    .badge.DRAFT { background: #e2e3e5; color: #383d41; }
    .badge.SENT { background: #cff4fc; color: #055160; }
    .badge.PAID { background: #d1e7dd; color: #0f5132; }
    .badge.OVERDUE { background: #f8d7da; color: #842029; }
    
    .pagination { display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 20px; }
    .pagination button { padding: 5px 15px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 4px; }
    .pagination button:disabled { background: #f8f9fa; color: #aaa; cursor: not-allowed; }
  `]
})
export class BusinessInvoicesComponent implements OnInit {
  isVerified = false;
  profileId: number = 0;

  showCreateForm = false;
  invoiceForm: FormGroup;

  invoices: InvoiceDTO[] = [];
  currentPage = 0;
  totalPages = 0;

  constructor(
    private invoiceService: InvoiceService,
    private profileService: BusinessProfileService,
    private fb: FormBuilder
  ) {
    this.invoiceForm = this.fb.group({
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      totalAmount: ['', [Validators.required, Validators.min(0.01)]],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.profileService.getMyProfile().subscribe({
      next: (res) => {
        this.isVerified = res.data.isVerified;
        this.profileId = res.data.profileId;
        if (this.isVerified) {
          this.loadInvoices(0);
        }
      },
      error: (err) => console.error("Failed to load business profile", err)
    });
  }

  loadInvoices(page: number) {
    this.invoiceService.getInvoices(this.profileId, page, 10).subscribe({
      next: (res) => {
        // Assume API returns a paginated structure in data field
        this.invoices = res.data.content;
        this.currentPage = res.data.number;
        this.totalPages = res.data.totalPages;
      },
      error: (err) => console.error("Failed to load invoices", err)
    });
  }

  createInvoice() {
    if (this.invoiceForm.valid) {
      this.invoiceService.createInvoice(this.invoiceForm.value).subscribe({
        next: (res) => {
          this.showCreateForm = false;
          this.invoiceForm.reset();
          this.loadInvoices(this.currentPage); // Refresh current page
          alert("Invoice created successfully!");
        },
        error: (err) => {
          console.error(err);
          alert("Failed to create invoice: " + (err.error?.message || "Unknown error"));
        }
      });
    }
  }

  sendInvoice(id: number) {
    if (confirm("Are you sure you want to send this invoice to the customer?")) {
      this.invoiceService.sendInvoice(id).subscribe({
        next: () => {
          this.loadInvoices(this.currentPage);
          alert("Invoice sent successfully!");
        },
        error: (err) => alert("Failed to send invoice.")
      });
    }
  }

  markPaid(id: number) {
    if (confirm("Mark this invoice as manually paid?")) {
      this.invoiceService.markPaid(id).subscribe({
        next: () => {
          this.loadInvoices(this.currentPage);
          alert("Invoice marked as paid!");
        },
        error: (err) => alert("Failed to mark invoice as paid.")
      });
    }
  }
}
