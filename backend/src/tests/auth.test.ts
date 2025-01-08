// src/tests/user/signup.test.ts
import request from 'supertest';
import { createServer } from '../index';
import { MongooseService } from '../services/mongoose/mongoose.service';
import { clearDatabase } from './helpers';

describe('Auth - Login Tests', () => {
  let app: any;
  let mongooseService: MongooseService;
  let existingUser: any;

  beforeAll(async () => {
    mongooseService = await MongooseService.get();
    app = await createServer();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // Créer un utilisateur pour les tests
    await request(app)
      .post('/user/signup')
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "Password123!"
      });

    existingUser = await mongooseService.userService.model.findOne({
      email: "john.doe@example.com"
    });
    
    existingUser.isVerified = true;
    await existingUser.save();
  });

  describe('POST /user/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({
          email: "john.doe@example.com",
          password: "Password123!"
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({
          email: "john.doe@example.com",
          password: "WrongPassword"
        })
        .expect(401);

      expect(response.body.message).toBe("email et/ou mot de passe incorrect(s)");
    });

    it('should reject login for unverified user', async () => {
      // Réinitialiser isVerified à false
      existingUser.isVerified = false;
      await existingUser.save();

      const response = await request(app)
        .post('/user/login')
        .send({
          email: "john.doe@example.com",
          password: "Password123!"
        })
        .expect(400);

      expect(response.body.message).toContain("error lors de la connexion veuillez réessayer");
    });

    it('should allow login with token', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({
          email: "john.doe@example.com",
          token: existingUser.token
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({
          email: "nonexistent@example.com",
          password: "Password123!"
        })
        .expect(401);

      expect(response.body.message).toBe("email et/ou mot de passe incorrect(s)");
    });

    it('should handle missing credentials', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({})
        .expect(401);

      expect(response.body.message).toBe("email et/ou mot de passe incorrect(s)");
    });
  });
});