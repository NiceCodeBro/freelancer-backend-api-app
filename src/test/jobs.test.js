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

describe("Jobs /jobs/unpaid", () => {
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
    const unpaidJobs = await supertest(app).get('/jobs/unpaid');

    // then
    expect(unpaidJobs.status).toBe(401)
  });

  it('should throw Unauthorized Exception on incompatible profile id', async () => {
    // given

    // when
    const unpaidJobs = await supertest(app).get('/jobs/unpaid').set('profile_id', '10');

    // then
    expect(unpaidJobs.status).toBe(401)
  });

  it('should return correct unpaid jobs object if everything passed truly', async () => {
    // given

    // when
    const unpaidJobs = await supertest(app).get('/jobs/unpaid').set('profile_id', '2');

    // then
    const expected = [{id: 1, description: "work", price: 202, paid: null, paymentDate: null, ContractId: 3}];
    
    expect(unpaidJobs.status).toBe(200)
    expect(unpaidJobs.text).toBe(JSON.stringify(expected))
  });

  it('should return status code 500 if there is a problem with database', async () => {
    // given
    await Job.drop();

    // when
    const unpaidJobs = await supertest(app).get('/jobs/unpaid').set('profile_id', '6');

    // then
    expect(unpaidJobs.status).toBe(500)
  });
})

describe("Jobs /jobs/:job_id/pay", () => {
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
    const unpaidJobs = await supertest(app).post('/jobs/4/pay');

    // then
    expect(unpaidJobs.status).toBe(401)
  });

  it('should throw Unauthorized Exception on incompatible profile id', async () => {
    // given

    // when
    const unpaidJobs = await supertest(app).post('/jobs/4/pay').set('profile_id', '10');

    // then
    expect(unpaidJobs.status).toBe(401)
  });

  it('should return correct unpaid jobs object if everything passed truly', async () => {
    // given
    const clientBalanceBeforePayment = await Profile.findByPk(2);
    const contractorBalanceBeforePayment = await Profile.findByPk(6);
    const jobId = 1;
    const job = await Job.findByPk(jobId);

    // when
    const unpaidJobs = await supertest(app).post(`/jobs/${jobId}/pay`).set('profile_id', '2');

    // then
    const clientBalanceAfterPayment = await Profile.findByPk(2);
    const contractorBalanceAfterPayment = await Profile.findByPk(6);

    
    expect(unpaidJobs.status).toBe(200)
    expect(clientBalanceBeforePayment.balance - job.price).toBe(clientBalanceAfterPayment.balance)
    expect(contractorBalanceBeforePayment.balance + job.price).toBe(contractorBalanceAfterPayment.balance)
  });

  it('should return status code 500 if there is a problem with database', async () => {
    // given
    await Job.drop();

    // when
    const unpaidJobs = await supertest(app).post('/jobs/4/pay').set('profile_id', '6');

    // then
    expect(unpaidJobs.status).toBe(500)
  });
})