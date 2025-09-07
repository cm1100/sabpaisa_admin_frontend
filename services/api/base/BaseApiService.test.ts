/**
 * Unit tests for BaseApiService
 */
import axios from 'axios';
import { BaseApiService, ApiError } from './BaseApiService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create a concrete implementation for testing
class TestApiService extends BaseApiService {
  protected readonly endpoint = '/test';
  public readonly serviceName = 'TestService';

  // Expose protected methods for testing
  public testGet<T>(path: string) {
    return this.get<T>(path);
  }

  public testPost<T>(path: string, data?: any) {
    return this.post<T>(path, data);
  }

  public testPut<T>(path: string, data?: any) {
    return this.put<T>(path, data);
  }

  public testDelete<T>(path: string) {
    return this.delete<T>(path);
  }

  public testBuildQueryString(params: Record<string, any>) {
    return this.buildQueryString(params);
  }

  public testTransformError(error: any) {
    return this.transformError(error);
  }
}

describe('BaseApiService', () => {
  let service: TestApiService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock axios.create
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Create service instance
    service = new TestApiService('http://localhost:3000');
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should setup interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('HTTP methods', () => {
    describe('get', () => {
      it('should make GET request with correct path', async () => {
        const mockData = { id: 1, name: 'Test' };
        mockAxiosInstance.get.mockResolvedValue({ data: mockData });

        const result = await service.testGet('/items');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test/items', undefined);
        expect(result).toEqual(mockData);
      });

      it('should handle GET request error', async () => {
        const error = {
          response: {
            status: 404,
            data: { message: 'Not found' },
          },
        };
        mockAxiosInstance.get.mockRejectedValue(error);

        await expect(service.testGet('/items')).rejects.toThrow(ApiError);
      });
    });

    describe('post', () => {
      it('should make POST request with data', async () => {
        const postData = { name: 'New Item' };
        const mockResponse = { id: 1, ...postData };
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

        const result = await service.testPost('/items', postData);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/test/items',
          postData,
          undefined
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('put', () => {
      it('should make PUT request with data', async () => {
        const putData = { name: 'Updated Item' };
        const mockResponse = { id: 1, ...putData };
        mockAxiosInstance.put.mockResolvedValue({ data: mockResponse });

        const result = await service.testPut('/items/1', putData);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith(
          '/test/items/1',
          putData,
          undefined
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('delete', () => {
      it('should make DELETE request', async () => {
        mockAxiosInstance.delete.mockResolvedValue({ data: { success: true } });

        const result = await service.testDelete('/items/1');

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
          '/test/items/1',
          undefined
        );
        expect(result).toEqual({ success: true });
      });
    });
  });

  describe('buildQueryString', () => {
    it('should build query string from params object', () => {
      const params = {
        page: 1,
        limit: 10,
        search: 'test',
        active: true,
        empty: null,
        undefined: undefined,
      };

      const queryString = service.testBuildQueryString(params);

      expect(queryString).toBe('page=1&limit=10&search=test&active=true');
    });

    it('should handle empty params', () => {
      const queryString = service.testBuildQueryString({});
      expect(queryString).toBe('');
    });
  });

  describe('transformError', () => {
    it('should transform axios error with response to ApiError', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad Request', errors: ['Invalid input'] },
        },
        message: 'Request failed',
      };

      const apiError = service.testTransformError(error);

      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.statusCode).toBe(400);
      expect(apiError.message).toBe('Bad Request');
      expect(apiError.data).toEqual({ message: 'Bad Request', errors: ['Invalid input'] });
    });

    it('should handle error without response', () => {
      const error = {
        message: 'Network Error',
      };

      const apiError = service.testTransformError(error);

      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.statusCode).toBe(500);
      expect(apiError.message).toBe('Network Error');
    });

    it('should handle error without message', () => {
      const error = {};

      const apiError = service.testTransformError(error);

      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.statusCode).toBe(500);
      expect(apiError.message).toBe('Network error occurred');
    });
  });

  describe('auth token handling', () => {
    beforeEach(() => {
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn(),
        },
        writable: true,
      });
    });

    it('should add auth token to request headers when available', () => {
      const mockToken = 'test-token';
      (window.localStorage.getItem as jest.Mock).mockReturnValue(mockToken);

      // Get the request interceptor function
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('should not add auth token when not available', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });
});