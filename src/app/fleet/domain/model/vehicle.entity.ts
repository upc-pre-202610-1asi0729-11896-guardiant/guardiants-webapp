import { BaseEntity } from '../../../shared/domain/model/base.entity';
import { VehicleLoan } from './vehicle-loan.entity';

export enum VehicleStatusValue {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LOAN = 'ON_LOAN',
  MAINTENANCE = 'MAINTENANCE',
}

/** Association of an IoT tracking device to a vehicle. */
export class DeviceAssignment extends BaseEntity {
  constructor(
    id: string,
    public vehicleId: string,
    public deviceSerial: string,
    public assignedAt: string,
    public unassignedAt: string | null,
  ) {
    super(id);
  }

  isActive(): boolean {
    return this.unassignedAt === null;
  }
}

/** A tracked vehicle belonging to a fleet. */
export class Vehicle extends BaseEntity {
  constructor(
    id: string,
    public fleetId: string,
    public plate: string,
    public model: string,
    public brand: string,
    public year: number,
    public status: VehicleStatusValue,
    public currentAssignment: VehicleLoan | null = null,
    public deviceAssignment: DeviceAssignment | null = null,
  ) {
    super(id);
  }

  isActive(): boolean {
    return this.status === VehicleStatusValue.ACTIVE;
  }

  isAvailableForLoan(): boolean {
    return this.status === VehicleStatusValue.ACTIVE && this.currentAssignment === null;
  }

  isAssignedToPersonnel(): boolean {
    return this.status === VehicleStatusValue.ON_LOAN && this.currentAssignment !== null;
  }

  hasDeviceAssigned(): boolean {
    return this.deviceAssignment !== null && this.deviceAssignment.isActive();
  }
}
