import { BaseEntity } from '../../../shared/domain/model/base.entity';

export enum OrganizationType {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY',
  GOVERNMENT = 'GOVERNMENT',
}

/** A fleet owned by an individual, company or government organization. */
export class Fleet extends BaseEntity {
  constructor(
    id: string,
    public ownerId: string,
    public name: string,
    public organizationType: OrganizationType,
    public createdAt: string,
  ) {
    super(id);
  }

  isGovernmentOrCompany(): boolean {
    return (
      this.organizationType === OrganizationType.GOVERNMENT ||
      this.organizationType === OrganizationType.COMPANY
    );
  }
}
