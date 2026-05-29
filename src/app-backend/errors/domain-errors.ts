export const DOMAIN_ERROR_CODES = {
  odometerTimeline: 'ODOMETER_TIMELINE',
  entityNotFound: 'ENTITY_NOT_FOUND',
} as const;

export type DomainErrorCode = (typeof DOMAIN_ERROR_CODES)[keyof typeof DOMAIN_ERROR_CODES];

export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

export class OdometerTimelineError extends DomainError {
  constructor(message: string) {
    super(DOMAIN_ERROR_CODES.odometerTimeline, message);
    this.name = 'OdometerTimelineError';
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(DOMAIN_ERROR_CODES.entityNotFound, `${entity} not found: ${id}`);
    this.name = 'EntityNotFoundError';
  }
}
