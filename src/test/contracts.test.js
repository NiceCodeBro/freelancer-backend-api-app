const app = require('../app');
const supertest = require('supertest');
const { Profile, Contract  } = require('../model');

describe("Contracts", () => {
  beforeEach(async () => {
    await Profile.sync({ force: true });
    await Contract.sync({ force: true });
    await fillTheDb();
  });

  afterEach(async () => { });

  const fillTheDb = async () => {
    await Promise.all([
      Profile.create({
        id: 7,
        firstName: 'James',
        lastName: 'Bond',
        profession: 'Runner',
        balance: 497,
        type: 'client',
      }),
      Profile.create({
        id: 5,
        firstName: 'Rollo',
        lastName: 'Tomassi',
        profession: 'Author',
        balance: 122,
        type: 'contractor',
      }),
      Contract.create({
        id: 12,
        terms: 'lorem ipsum dolar',
        status: 'in progress',
        ClientId: 5,
        ContractorId: 7,
      })
  
    ]);
  }

  it('should throw Unauthorized Exception on missing profile id', async () => {
    // given

    // when
    const contract = await supertest(app).get('/contracts/7');

    // then
    expect(contract.status).toBe(401)

  });

  it('should throw Unauthorized Exception on incompatible profile id', async () => {
    // given

    // when
    const contract = await supertest(app).get('/contracts/5').set('profile_id', '10');

    // then
    expect(contract.status).toBe(401)
  });

  it('should return correct contract object if everything passed truly', async () => {
    // given

    // when
    const contract = await supertest(app).get('/contracts/12').set('profile_id', '5');

    // then
    const expected = {
      "id": 12,
      "terms": "lorem ipsum dolar",
      "status": "in progress",
      "ContractorId": 7,
      "ClientId": 5
    };
    expect(contract.status).toBe(200)
    expect(contract.text).toBe(JSON.stringify(expected))
  });

  it('should return status code 500 if there is a problem with database', async () => {
    // given
    await Contract.drop();

    // when
    const contract = await supertest(app).get('/contracts/5').set('profile_id', '5');

    // then
    expect(contract.status).toBe(500)
  });
})