import { BaseEntity } from '../../../shared/domain/model/base.entity';

/** Aggregated driving metrics for a vehicle over a period. */
export class DrivingReport extends BaseEntity {
  constructor(
    id: string,
    public vehicleId: string,
    public periodStart: string,
    public periodEnd: string,
    public totalDistanceKm: number,
    public totalDurationMinutes: number,
    public averageSpeedKmh: number,
    public drivingScore: number,
    public harshBrakingEvents: number,
    public harshAccelerationEvents: number,
  ) {
    super(id);
  }

  isHighRisk(thresholdScore: number): boolean {
    return this.drivingScore < thresholdScore;
  }
}
