import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { Vehicle } from '../../../domain/model/vehicle.entity';

@Component({
  selector: 'app-vehicle-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-map.html',
  styleUrls: ['./vehicle-map.css'],
})
export class VehicleMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() vehicles: Vehicle[] = [];
  @Input() selectedVehicle: Vehicle | null = null;
  @Input() height = '300px';

  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private markersLayer = L.layerGroup();

  ngAfterViewInit(): void {
    this.initMap();
    this.renderMarkers();
  }

  ngOnChanges(_: SimpleChanges): void {
    this.renderMarkers();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    if (!this.mapContainer || this.map) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      attributionControl: true,
    }).setView([-12.0974, -77.0362], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
  }

  private renderMarkers(): void {
    if (!this.map) return;

    this.markersLayer.clearLayers();
    const vehiclesWithLocation = this.vehicles.filter(
      (vehicle) => typeof vehicle.lastLat === 'number' && typeof vehicle.lastLng === 'number',
    );

    vehiclesWithLocation.forEach((vehicle) => {
      const marker = L.marker([vehicle.lastLat!, vehicle.lastLng!], {
        icon: this.createVehicleIcon(vehicle),
      }).bindPopup(
        `<strong>${vehicle.plate}</strong><br>${vehicle.brand} ${vehicle.model}<br>${vehicle.lastLocation ?? ''}`,
      );
      marker.addTo(this.markersLayer);
    });

    const target = this.selectedVehicle ?? vehiclesWithLocation[0];
    if (typeof target?.lastLat === 'number' && typeof target?.lastLng === 'number') {
      this.map.setView([target.lastLat, target.lastLng], this.selectedVehicle ? 15 : 12);
      return;
    }

    if (vehiclesWithLocation.length > 1) {
      const bounds = L.latLngBounds(
        vehiclesWithLocation.map((vehicle) => [vehicle.lastLat!, vehicle.lastLng!]),
      );
      this.map.fitBounds(bounds, { padding: [24, 24] });
    }
  }

  private createVehicleIcon(vehicle: Vehicle): L.DivIcon {
    const statusClass = vehicle.status.toLowerCase();
    return L.divIcon({
      className: `vehicle-map-marker vehicle-map-marker--${statusClass}`,
      html: `<span>${vehicle.plate}</span>`,
      iconSize: [78, 28],
      iconAnchor: [39, 14],
    });
  }
}
