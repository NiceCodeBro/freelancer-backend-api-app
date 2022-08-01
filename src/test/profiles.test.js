
const app = require('../app');
const supertest = require('supertest');
const { Profile, Contract, Job  } = require('../model');

const fillTheDb = async () => {
  await Promise.all([

    Profile.create({
      id: 2,
      firstName: 'Mr',
      lastName: 'Robot',
      profession: 'Hacker',
      balance: 231.11,
      type:'client'
    }),
    Profile.create({
      id: 6,
      firstName: 'Linus',
      lastName: 'Torvalds',
      profession: 'Programmer',
      balance: 1214,
      type:'contractor'
    }),
    Contract.create({
      id:3,
      terms: 'bla bla bla',
      status: 'in_progress',
      ClientId: 2,
      ContractorId: 6
    }),
    Job.create({
      description: 'work',
      price: 202,
      ContractId: 3,
    })
  ]);
}

describe("Profiles '/balances/deposit/:userId", () => {
  beforeEach(async () => {
    await Profile.sync({ force: true });
    await Contract.sync({ force: true });
    await Job.sync({ force: true });
    await fillTheDb();
  });

  afterEach(async () => { });

  it('should throw Unauthorized Exception on missing profile id', async () => {
    // given

    // when
    const unpaidJobs = await supertest(app).post('/balances/deposit/:userId');

    // then
    expect(unpaidJobs.status).toBe(401)
  });

  it('should throw Unauthorized Exception on incompatible profile id', async () => {
    // given

    // when
    const unpaidJobs = await supertest(app).post('/balances/deposit/:userId').set('profile_id', '10');

    // then
    expect(unpaidJobs.status).toBe(401)
  });

  it('should be able to deposit the amount if it is less than 25% his total of jobs to pay', async () => {
    // given
    const clientBeforePayment = await Profile.findByPk(2);
    const amount = 20;

    // when
    const unpaidJobs = await supertest(app).post('/balances/deposit/2').set('profile_id', '2').send({amount});

    // then 
    const clientAfterPayment = await Profile.findByPk(2);
    expect(unpaidJobs.status).toBe(200)
    expect(clientBeforePayment.balance + amount).toBe(clientAfterPayment.balance)
  });

  it('should return 422 the deposit amount more than 25% his total of jobs to pay', async () => {
    // given
    const clientBeforePayment = await Profile.findByPk(2);
    const amount = 100; // amount which is more than 25% of job sum

    // when
    const unpaidJobs = await supertest(app).post('/balances/deposit/2').set('profile_id', '2').send({amount});

    // then 
    const clientAfterPayment = await Profile.findByPk(2);
    expect(unpaidJobs.status).toBe(422)
    expect(clientBeforePayment.balance).toBe(clientAfterPayment.balance)
  });

})