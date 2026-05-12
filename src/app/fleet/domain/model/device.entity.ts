import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Represents a tracking device.
 */
export class Device implements BaseEntity {
  constructor(props: {
    id: string;
    vehicleId: string;
    serialNumber: string;
    status: string;
    assignedAt: Date;
    unassignedAt?: Date;
  }) {
    this._id = props.id;
    this._vehicleId = props.vehicleId;
    this._serialNumber = props.serialNumber;
    this._status = props.status;
    this._assignedAt = props.assignedAt;
    this._unassignedAt = props.unassignedAt;
  }

  private _id: string;

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  private _vehicleId: string;

  get vehicleId(): string {
    return this._vehicleId;
  }

  set vehicleId(value: string) {
    this._vehicleId = value;
  }

  private _serialNumber: string;

  get serialNumber(): string {
    return this._serialNumber;
  }

  set serialNumber(value: string) {
    this._serialNumber = value;
  }

  private _status: string;

  get status(): string {
    return this._status;
  }

  set status(value: string) {
    this._status = value;
  }

  private _assignedAt: Date;

  get assignedAt(): Date {
    return this._assignedAt;
  }

  set assignedAt(value: Date) {
    this._assignedAt = value;
  }

  private _unassignedAt?: Date;

  get unassignedAt(): Date | undefined {
    return this._unassignedAt;
  }

  set unassignedAt(value: Date | undefined) {
    this._unassignedAt = value;
  }
}
