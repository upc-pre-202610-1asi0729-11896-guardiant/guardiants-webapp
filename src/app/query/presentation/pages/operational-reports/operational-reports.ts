import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { IamStore } from '../../../../iam/application/iam.store';

interface DrivingReport {
  id: string;
  vehicleId: string;
  periodStart: string;
  periodEnd: string;
  score: number;
  totalKm: number;
  summary: string;
  generatedAt: string;
}

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  organizationId: string;
}

@Component({
  selector: 'app-operational-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './operational-reports.html',
  styleUrls: ['./operational-reports.css'],
})
export class OperationalReports implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly iamStore = inject(IamStore);

  readonly reports = signal<DrivingReport[]>([]);
  readonly vehicles = signal<Vehicle[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly organizationId = this.iamStore.organizationId;

  // Create report modal properties
  readonly showCreateModal = signal(false);
  readonly isCreating = signal(false);
  readonly selectedVehicleId = signal('');
  readonly periodStart = signal('');
  readonly periodEnd = signal('');
  readonly score = signal<number>(0);
  readonly totalKm = signal<number>(0);
  readonly summary = signal('');

  readonly vehicleMap = computed(() => {
    const map = new Map<string, Vehicle>();
    this.vehicles().forEach(vehicle => map.set(vehicle.id, vehicle));
    return map;
  });

  ngOnInit(): void {
    this.isLoading.set(true);
    this.loadReports();
    this.loadVehicles();
  }

  getVehicleInfo(vehicleId: string): Vehicle | undefined {
    return this.vehicleMap().get(vehicleId);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  downloadReport(report: DrivingReport): void {
    const vehicle = this.getVehicleInfo(report.vehicleId);
    const vehicleName = vehicle ? `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}` : 'Vehículo desconocido';

    const content = `
REPORTE OPERACIONAL - GOD'S TRACKER
=====================================

Vehículo: ${vehicleName}
Período: ${this.formatDate(report.periodStart)} - ${this.formatDate(report.periodEnd)}
Fecha de generación: ${this.formatDate(report.generatedAt)}

Puntuación de conducción: ${report.score}/100
Kilómetros totales: ${report.totalKm} km

Resumen:
${report.summary}

---
Generado por God's Tracker - Sistema de Monitoreo Vehicular
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${vehicle?.plate || 'vehiculo'}-${new Date(report.generatedAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  openCreateReportModal(): void {
    this.showCreateModal.set(true);
    this.resetForm();
  }

  closeCreateReportModal(): void {
    this.showCreateModal.set(false);
    this.resetForm();
  }

  createReport(): void {
    if (!this.selectedVehicleId() || !this.periodStart() || !this.periodEnd() || !this.summary()) {
      return;
    }

    this.isCreating.set(true);

    const newReport: Omit<DrivingReport, 'id'> = {
      vehicleId: this.selectedVehicleId(),
      periodStart: new Date(this.periodStart()).toISOString(),
      periodEnd: new Date(this.periodEnd()).toISOString(),
      score: this.score(),
      totalKm: this.totalKm(),
      summary: this.summary(),
      generatedAt: new Date().toISOString(),
    };

    this.http.post<DrivingReport>(`${environment.apiBaseUrl}/drivingReportView`, newReport).subscribe({
      next: (createdReport) => {
        this.reports.update(reports => [...reports, createdReport]);
        this.closeCreateReportModal();
        this.isCreating.set(false);
      },
      error: (error) => {
        this.error.set(error?.message ?? 'Error creating report.');
        this.isCreating.set(false);
      },
    });
  }

  private resetForm(): void {
    this.selectedVehicleId.set('');
    this.periodStart.set('');
    this.periodEnd.set('');
    this.score.set(0);
    this.totalKm.set(0);
    this.summary.set('');
  }

  private loadReports(): void {
    this.http.get<DrivingReport[]>(`${environment.apiBaseUrl}/drivingReportView`).subscribe({
      next: (reports) => {
        // Filter reports for current organization
        const orgReports = reports.filter(report =>
          this.vehicles().some(vehicle => vehicle.id === report.vehicleId)
        );
        this.reports.set(orgReports);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set(error?.message ?? 'Error loading reports.');
        this.isLoading.set(false);
      },
    });
  }

  private loadVehicles(): void {
    this.http.get<Vehicle[]>(`${environment.apiBaseUrl}/vehicles`).subscribe({
      next: (vehicles) => {
        // Filter vehicles for current organization
        const orgVehicles = vehicles.filter(vehicle => vehicle.organizationId === this.organizationId());
        this.vehicles.set(orgVehicles);
        // Reload reports now that we have vehicles
        this.loadReports();
      },
      error: () => {
        // Continue without vehicles
        this.loadReports();
      },
    });
  }
}
