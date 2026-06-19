/**
 * Base class for all domain entities. Identity-based equality.
 */
export abstract class BaseEntity {
  protected constructor(public id: string) {}

  equals(other: BaseEntity | null | undefined): boolean {
    if (!other) return false;
    return this.id === other.id;
  }
}
