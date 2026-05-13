import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../../domain/model/vehicle.entity';

@Component({
  selector: 'app-vehicle-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-item.html',
  styleUrls: ['./vehicle-item.css'],
})
export class VehicleItemComponent {
  @Input() vehicle!: Vehicle;

  get statusClass(): string {
    return this.vehicle?.status?.toLowerCase() || 'unknown';
  }

  get statusLabel(): string {
    const statusMap: Record<string, string> = {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      MAINTENANCE: 'Mantenimiento',
      BLOCKED: 'Bloqueado',
    };
    return statusMap[this.vehicle?.status] || this.vehicle?.status || 'Desconocido';
  }
}
