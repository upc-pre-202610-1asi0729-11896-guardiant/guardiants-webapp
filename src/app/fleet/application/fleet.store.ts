import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehicle } from '../domain/model/vehicle.entity';
import { VehicleAssembler } from '../infrastructure/vehicle-assembler';
import { VehicleResource } from '../infrastructure/vehicle-response';

interface FleetState {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
}

export interface VehiclePayload {
  organizationId: string;
  plate: string;
  brand: string;
  model: string;
  status: string;
  capacity: number;
  lastLocation?: string;
  lastLat?: number;
  lastLng?: number;
  speedKmh?: number;
  batteryPct?: number;
  deviceStatus?: string;
}

@Injectable({ providedIn: 'root' })
export class FleetStore {
  private readonly http = inject(HttpClient);
  private readonly assembler = new VehicleAssembler();

  private readonly _state = signal<FleetState>({
    vehicles: [],
    isLoading: false,
    error: null,
  });

  readonly vehicles = computed(() => this._state().vehicles);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  loadVehicles(): Observable<Vehicle[]> {
    this._patch({ isLoading: true, error: null });

    return this.http.get<VehicleResource[]>(`${environment.apiBaseUrl}/vehicles`).pipe(
      tap((response) => {
        const vehicles = this.assembler.toEntitiesFromResponse(response);
        this._patch({ vehicles, isLoading: false });
      }),
      map(() => this._state().vehicles),
      catchError((err) => {
        const errorMsg = err?.message ?? 'Error al cargar vehiculos.';
        this._patch({ isLoading: false, error: errorMsg });
        return throwError(() => err);
      }),
    );
  }

  blockVehicle(vehicleId: string): Observable<Vehicle> {
    return this.updateVehicleStatus(vehicleId, 'BLOCKED');
  }

  unblockVehicle(vehicleId: string): Observable<Vehicle> {
    return this.updateVehicleStatus(vehicleId, 'ACTIVE');
  }

  createVehicle(payload: VehiclePayload): Observable<Vehicle> {
    const resource: VehicleResource = {
      ...payload,
      id: `VEH-${Date.now()}`,
      createdAt: new Date(),
      lastUpdated: 'now',
      mileageKm: 0,
    };

    return this.http.post<VehicleResource>(`${environment.apiBaseUrl}/vehicles`, resource).pipe(
      tap((response) => {
        const createdVehicle = this.assembler.toEntityFromResource(response);
        this._patch({ vehicles: [...this._state().vehicles, createdVehicle] });
      }),
      map((response) => this.assembler.toEntityFromResource(response)),
      catchError((err) => {
        const errorMsg = err?.message ?? 'Error al crear vehiculo.';
        this._patch({ error: errorMsg });
        return throwError(() => err);
      }),
    );
  }

  updateVehicle(vehicleId: string, payload: Partial<VehiclePayload>): Observable<Vehicle> {
    return this.http
      .patch<VehicleResource>(`${environment.apiBaseUrl}/vehicles/${vehicleId}`, {
        ...payload,
        lastUpdated: 'now',
      })
      .pipe(
        tap((response) => {
          const updatedVehicle = this.assembler.toEntityFromResource(response);
          const vehicles = this._state().vehicles.map((v) =>
            v.id === vehicleId ? updatedVehicle : v,
          );
          this._patch({ vehicles });
        }),
        map((response) => this.assembler.toEntityFromResource(response)),
        catchError((err) => {
          const errorMsg = err?.message ?? 'Error al actualizar vehiculo.';
          this._patch({ error: errorMsg });
          return throwError(() => err);
        }),
      );
  }

  updateVehicleStatus(vehicleId: string, status: string): Observable<Vehicle> {
    return this.updateVehicle(vehicleId, { status });
  }

  deleteVehicle(vehicleId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/vehicles/${vehicleId}`).pipe(
      tap(() => {
        this._patch({
          vehicles: this._state().vehicles.filter((vehicle) => vehicle.id !== vehicleId),
        });
      }),
      catchError((err) => {
        const errorMsg = err?.message ?? 'Error al eliminar vehiculo.';
        this._patch({ error: errorMsg });
        return throwError(() => err);
      }),
    );
  }

  private _patch(partial: Partial<FleetState>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
