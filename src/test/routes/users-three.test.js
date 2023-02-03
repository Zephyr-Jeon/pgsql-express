const request = require('supertest');
const buildApp = require('../../app');
const UserRepo = require('../../repos/user-repo');
const pool = require('../../pool');
const Context = require('../context');

let context;

beforeAll(async () => {
  context = await Context.build();
});

beforeEach(async () => {
  context.reset();
});

afterAll(() => {
  return context.close();
});

it('create a user', async () => {
  const startingCount = await UserRepo.count();
  // expect(startingCount).toEqual(0);

  await request(buildApp())
    .post('/users')
    .send({ username: 'testUser', bio: 'testUser bio' })
    .expect(200);

  const finishCount = await UserRepo.count();
  expect(finishCount - startingCount).toEqual(1);
});
