require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns todos for one user', async() => {

      const expectation = [
        {
          'id': 4,
          'chore': 'wash the dishes',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 5,
          'chore': 'vacuum',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 6,
          'chore': 'take out the trash',
          'completed': false,
          'owner_id': 2
        }
      ];

      await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[0])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[1])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[2])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('ADDS one todo/task for one user', async() => {

      const expectation = {
        'id': 7,
        'chore': 'walk the dog',
        'completed': false,
        'owner_id': 2
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send({
          'chore': 'walk the dog',
          'completed': false,
        })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('UPDATES one todo/task for one user', async() => {

      const expectation = {
        'id': 7,
        'chore': 'walk the dog',
        'completed': true,
        'owner_id': 2
      };

      const data = await fakeRequest(app)
        .put('/api/todos/7')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


  });
});
