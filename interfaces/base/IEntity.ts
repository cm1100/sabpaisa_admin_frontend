/**
 * Base entity interface following SOLID principles
 * All domain entities should extend this interface
 */
export interface IEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for entities that can be soft deleted
 */
export interface ISoftDeletable {
  deletedAt?: Date | null;
  isDeleted: boolean;
}

/**
 * Interface for entities that have a status
 */
export interface IStatusable {
  status: string;
  statusChangedAt?: Date;
}

/**
 * Interface for entities that can be archived
 */
export interface IArchivable {
  archivedAt?: Date | null;
  isArchived: boolean;
}

/**
 * Interface for entities with audit fields
 */
export interface IAuditable {
  createdBy: string;
  updatedBy: string;
  createdByName?: string;
  updatedByName?: string;
}