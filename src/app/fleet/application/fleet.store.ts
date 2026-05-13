import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Vehicle } from '../domain/model/vehicle.entity';
import { VehicleAssembler } from '../infrastructure/vehicle-assembler';
import { Observable, catchError, tap, throwError, map } from 'rxjs';

interface FleetState {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
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

  // ── Public signals (read-only projections) ───────────────────────────────
  readonly vehicles = computed(() => this._state().vehicles);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  // ── Actions ────────────────────────────────────────────────────────────────
  loadVehicles(): Observable<Vehicle[]> {
    this._patch({ isLoading: true, error: null });

    return this.http.get<Vehicle[]>('http://localhost:3000/vehicles').pipe(
      tap((response) => {
        const vehicles = this.assembler.toEntitiesFromResponse(response);
        this._patch({ vehicles, isLoading: false });
      }),
      map(() => this._state().vehicles),
      catchError((err) => {
        const errorMsg = err?.message ?? 'Error al cargar vehículos.';
        this._patch({ isLoading: false, error: errorMsg });
        return throwError(() => err);
      }),
    );
  }

  // ── Private helpers ────────────────────────────────────────────────────
  private _patch(partial: Partial<FleetState>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}



