import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Represents a vehicle in the fleet domain.
 */
export class Vehicle implements BaseEntity {
  constructor(props: {
    id: string;
    organizationId: string;
    plate: string;
    model: string;
    brand: string;
    status: string;
    capacity: number;
    createdAt: Date;
    lastLocation?: string;
    lastUpdated?: string;
    mileageKm?: number;
    lastLat?: number;
    lastLng?: number;
    speedKmh?: number;
    batteryPct?: number;
    deviceStatus?: string;
  }) {
    this._id = props.id;
    this._organizationId = props.organizationId;
    this._plate = props.plate;
    this._model = props.model;
    this._brand = props.brand;
    this._status = props.status;
    this._capacity = props.capacity;
    this._createdAt = props.createdAt;
    this._lastLocation = props.lastLocation;
    this._lastUpdated = props.lastUpdated;
    this._mileageKm = props.mileageKm;
    this._lastLat = props.lastLat;
    this._lastLng = props.lastLng;
    this._speedKmh = props.speedKmh;
    this._batteryPct = props.batteryPct;
    this._deviceStatus = props.deviceStatus;
  }

  private _id: string;

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  private _organizationId: string;

  get organizationId(): string {
    return this._organizationId;
  }

  set organizationId(value: string) {
    this._organizationId = value;
  }

  private _plate: string;

  get plate(): string {
    return this._plate;
  }

  set plate(value: string) {
    this._plate = value;
  }

  private _model: string;

  get model(): string {
    return this._model;
  }

  set model(value: string) {
    this._model = value;
  }

  private _brand: string;

  get brand(): string {
    return this._brand;
  }

  set brand(value: string) {
    this._brand = value;
  }

  private _status: string;

  get status(): string {
    return this._status;
  }

  set status(value: string) {
    this._status = value;
  }

  private _capacity: number;

  get capacity(): number {
    return this._capacity;
  }

  set capacity(value: number) {
    this._capacity = value;
  }

  private _createdAt: Date;

  get createdAt(): Date {
    return this._createdAt;
  }

  set createdAt(value: Date) {
    this._createdAt = value;
  }

  private _lastLocation?: string;

  get lastLocation(): string | undefined {
    return this._lastLocation;
  }

  set lastLocation(value: string | undefined) {
    this._lastLocation = value;
  }

  private _lastUpdated?: string;

  get lastUpdated(): string | undefined {
    return this._lastUpdated;
  }

  set lastUpdated(value: string | undefined) {
    this._lastUpdated = value;
  }

  private _mileageKm?: number;

  get mileageKm(): number | undefined {
    return this._mileageKm;
  }

  set mileageKm(value: number | undefined) {
    this._mileageKm = value;
  }

  private _lastLat?: number;

  get lastLat(): number | undefined {
    return this._lastLat;
  }

  set lastLat(value: number | undefined) {
    this._lastLat = value;
  }

  private _lastLng?: number;

  get lastLng(): number | undefined {
    return this._lastLng;
  }

  set lastLng(value: number | undefined) {
    this._lastLng = value;
  }

  private _speedKmh?: number;

  get speedKmh(): number | undefined {
    return this._speedKmh;
  }

  set speedKmh(value: number | undefined) {
    this._speedKmh = value;
  }

  private _batteryPct?: number;

  get batteryPct(): number | undefined {
    return this._batteryPct;
  }

  set batteryPct(value: number | undefined) {
    this._batteryPct = value;
  }

  private _deviceStatus?: string;

  get deviceStatus(): string | undefined {
    return this._deviceStatus;
  }

  set deviceStatus(value: string | undefined) {
    this._deviceStatus = value;
  }
}
