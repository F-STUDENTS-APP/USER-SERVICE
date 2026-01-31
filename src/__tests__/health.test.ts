import request from 'supertest';
import app from '../app';

describe('User Service Health Check', () => {
  describe('GET /health', () => {
    it('should return 200 status code', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    it('should return correct service name', async () => {
      const response = await request(app).get('/health');
      expect(response.body).toHaveProperty('service', 'user-service');
    });

    it('should return UP status', async () => {
      const response = await request(app).get('/health');
      expect(response.body).toHaveProperty('status', 'UP');
    });

    it('should include timestamp', async () => {
      const response = await request(app).get('/health');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });
});
