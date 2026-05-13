// src/app/alerting/infrastructure/alert-assembler.ts

import { AlertEntity } from '../domain/model/alert.entity';
import { AlertResource } from './alert-response';

export class AlertAssembler {
  toEntity(resource: AlertResource): AlertEntity {
    return AlertEntity.fromJson(resource as unknown as Record<string, unknown>);
  }

  toEntities(resources: AlertResource[]): AlertEntity[] {
    return resources.map((r) => this.toEntity(r));
  }
}
