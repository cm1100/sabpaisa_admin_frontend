/**
 * Repository interfaces following Interface Segregation Principle (ISP)
 * Split into small, specific interfaces that can be composed
 */

/**
 * Interface for read operations
 */
export interface IReadable<T> {
  findById(id: string): Promise<T | null>;
  findAll(params?: any): Promise<T[]>;
  count(params?: any): Promise<number>;
}

/**
 * Interface for write operations
 */
export interface IWritable<T> {
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
}

/**
 * Interface for delete operations
 */
export interface IDeletable {
  delete(id: string): Promise<boolean>;
  softDelete?(id: string): Promise<boolean>;
}

/**
 * Interface for bulk operations
 */
export interface IBulkOperations<T> {
  createMany(data: Partial<T>[]): Promise<T[]>;
  updateMany(ids: string[], data: Partial<T>): Promise<T[]>;
  deleteMany(ids: string[]): Promise<boolean>;
}

/**
 * Interface for search operations
 */
export interface ISearchable<T> {
  search(query: string, params?: any): Promise<T[]>;
  searchWithPagination(query: string, page: number, limit: number): Promise<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}

/**
 * Interface for paginated operations
 */
export interface IPaginatable<T> {
  findPaginated(page: number, limit: number, params?: any): Promise<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}

/**
 * Complete repository interface combining all operations
 * Classes can implement only the interfaces they need
 */
export interface IRepository<T>
  extends IReadable<T>,
    IWritable<T>,
    IDeletable,
    IPaginatable<T> {}

/**
 * Extended repository with all features
 */
export interface IFullRepository<T>
  extends IRepository<T>,
    IBulkOperations<T>,
    ISearchable<T> {}