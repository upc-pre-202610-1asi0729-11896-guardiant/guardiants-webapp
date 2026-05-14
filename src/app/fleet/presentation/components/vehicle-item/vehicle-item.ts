import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Vehicle } from '../../../domain/model/vehicle.entity';

@Component({
  selector: 'app-vehicle-item',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './vehicle-item.html',
  styleUrls: ['./vehicle-item.css'],
})
export class VehicleItemComponent {
  @Input() vehicle!: Vehicle;

  get statusClass(): string {
    return this.vehicle?.status?.toLowerCase() || 'unknown';
  }

}
