import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog-container">
      <div class="dialog-header" [class.destructive]="data.isDestructive">
        <div class="icon-circle">
          <mat-icon>{{ data.isDestructive ? 'warning' : 'help_outline' }}</mat-icon>
        </div>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button type="button" (click)="onCancel()" class="btn-cancel">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          mat-flat-button 
          [color]="data.isDestructive ? 'warn' : 'primary'"
          (click)="onConfirm()"
          class="btn-confirm">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog-container {
      padding: 8px;
    }
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #eef2ff;
      color: #4f46e5;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .destructive .icon-circle {
      background: #fef2f2;
      color: #dc2626;
    }
    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
    }
    .dialog-content p {
      color: #475569;
      font-size: 0.9375rem;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    .dialog-actions {
      padding-top: 16px;
      gap: 8px;
    }
    .btn-cancel {
      font-weight: 600;
      color: #64748b;
    }
    .btn-confirm {
      font-weight: 600;
      border-radius: 8px;
    }
  `]
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
