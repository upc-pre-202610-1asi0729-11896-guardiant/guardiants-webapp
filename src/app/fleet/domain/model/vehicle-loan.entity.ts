import { BaseEntity } from '../../../shared/domain/model/base.entity';

export enum LoanStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ASSIGNED = 'ASSIGNED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURNED = 'RETURNED',
}

/** The lifecycle of a vehicle loan: request -> approve/reject -> assign -> return. */
export class VehicleLoan extends BaseEntity {
  constructor(
    id: string,
    public vehicleId: string,
    public fleetId: string,
    public requestedByPersonnelId: string,
    public approvedByApproverId: string | null,
    public status: LoanStatus,
    public requestedAt: string,
    public decidedAt: string | null,
    public assignedAt: string | null,
    public returnRequestedAt: string | null,
    public returnConfirmedAt: string | null,
    public rejectionReason: string | null,
    public expectedReturnDate: string,
  ) {
    super(id);
  }

  isPending(): boolean {
    return this.status === LoanStatus.REQUESTED;
  }

  isApproved(): boolean {
    return this.status === LoanStatus.APPROVED;
  }

  isActive(): boolean {
    return this.status === LoanStatus.ASSIGNED || this.status === LoanStatus.RETURN_REQUESTED;
  }

  isOverdue(): boolean {
    return this.isActive() && new Date(this.expectedReturnDate).getTime() < Date.now();
  }

  canBeApprovedBy(approverId: string): boolean {
    return this.isPending() && approverId !== this.requestedByPersonnelId;
  }

  canBeReturnedBy(personnelId: string): boolean {
    return this.status === LoanStatus.ASSIGNED && personnelId === this.requestedByPersonnelId;
  }
}
