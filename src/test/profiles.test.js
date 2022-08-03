
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


const fillTheDb2 = async () => {
  await Promise.all([
    Profile.create({
       id: 1,
       firstName: 'Harry',
       lastName: 'Potter',
       profession: 'Wizard',
       balance: 1150,
       type:'client'
     }),
     Profile.create({
       id: 2,
       firstName: 'Mr',
       lastName: 'Robot',
       profession: 'Hacker',
       balance: 231.11,
       type:'client'
     }),
     Profile.create({
       id: 3,
       firstName: 'John',
       lastName: 'Snow',
       profession: 'Knows nothing',
       balance: 451.3,
       type:'client'
     }),
     Profile.create({
       id: 4,
       firstName: 'Ash',
       lastName: 'Kethcum',
       profession: 'Pokemon master',
       balance: 1.3,
       type:'client'
     }),
     Profile.create({
       id: 5,
       firstName: 'John',
       lastName: 'Lenon',
       profession: 'Musician',
       balance: 64,
       type:'contractor'
     }),
     Profile.create({
       id: 6,
       firstName: 'Linus',
       lastName: 'Torvalds',
       profession: 'Programmer',
       balance: 1214,
       type:'contractor'
     }),
     Profile.create({
       id: 7,
       firstName: 'Alan',
       lastName: 'Turing',
       profession: 'Programmer',
       balance: 22,
       type:'contractor'
     }),
     Profile.create({
       id: 8,
       firstName: 'Aragorn',
       lastName: 'II Elessar Telcontarvalds',
       profession: 'Fighter',
       balance: 314,
       type:'contractor'
     }),
     Contract.create({
       id:1,
       terms: 'bla bla bla',
      status: 'terminated',
       ClientId: 1,
       ContractorId:5
     }),
     Contract.create({
       id:2,
       terms: 'bla bla bla',
       status: 'in_progress',
       ClientId: 1,
       ContractorId: 6
     }),
     Contract.create({
       id:3,
       terms: 'bla bla bla',
       status: 'in_progress',
       ClientId: 2,
       ContractorId: 6
     }),
     Contract.create({
       id: 4,
       terms: 'bla bla bla',
       status: 'in_progress',
       ClientId: 2,
       ContractorId: 7
     }),
     Contract.create({
       id:5,
       terms: 'bla bla bla',
       status: 'new',
       ClientId: 3,
       ContractorId: 8
     }),
     Contract.create({
       id:6,
       terms: 'bla bla bla',
       status: 'in_progress',
       ClientId: 3,
       ContractorId: 7
     }),
     Contract.create({
       id:7,
       terms: 'bla bla bla',
       status: 'in_progress',
       ClientId: 4,
       ContractorId: 7
     }),
     Contract.create({
       id:8,
       terms: 'bla bla bla',
       status: 'in_progress',
       ClientId: 4,
       ContractorId: 6
     }),
     Contract.create({
       id:9,
       terms: 'bla bla bla',
       status: 'in_progress',
       ClientId: 4,
       ContractorId: 8
     }),
     Job.create({
       description: 'work',
       price: 200,
       ContractId: 1,
     }),
     Job.create({
       description: 'work',
       price: 201,
       ContractId: 2,
     }),
     Job.create({
       description: 'work',
       price: 202,
       ContractId: 3,
     }),
     Job.create({
       description: 'work',
       price: 200,
       ContractId: 4,
     }),
     Job.create({
       description: 'work',
       price: 200,
       ContractId: 7,
     }),
     Job.create({
       description: 'work',
       price: 2020,
       paid:true,
       paymentDate:'2020-08-15T19:11:26.737Z',
       ContractId: 7,
     }),
     Job.create({
       description: 'work',
       price: 200,
       paid:true,
       paymentDate:'2020-08-15T19:11:26.737Z',
       ContractId: 2,
     }),
     Job.create({
       description: 'work',
       price: 200,
       paid:true,
       paymentDate:'2020-08-16T19:11:26.737Z',
       ContractId: 3,
     }),
     Job.create({
       description: 'work',
       price: 200,
       paid:true,
       paymentDate:'2020-08-17T19:11:26.737Z',
       ContractId: 1,
     }),
     Job.create({
       description: 'work',
       price: 200,
       paid:true,
       paymentDate:'2020-08-17T19:11:26.737Z',
       ContractId: 5,
     }),
     Job.create({
       description: 'work',
       price: 21,
       paid:true,
       paymentDate:'2020-08-10T19:11:26.737Z',
       ContractId: 1,
     }),
     Job.create({
       description: 'work',
       price: 21,
       paid:true,
       paymentDate:'2020-08-15T19:11:26.737Z',
       ContractId: 2,
     }),
     Job.create({
       description: 'work',
       price: 121,
       paid:true,
       paymentDate:'2020-08-15T19:11:26.737Z',
       ContractId: 3,
     }),
     Job.create({
       description: 'work',
       price: 121,
       paid:true,
       paymentDate:'2020-08-14T23:11:26.737Z',
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
    const result = await supertest(app).post('/balances/deposit/:userId');

    // then
    expect(result.status).toBe(401)
  });

  it('should throw Unauthorized Exception on incompatible profile id', async () => {
    // given

    // when
    const result = await supertest(app).post('/balances/deposit/:userId').set('profile_id', '10');

    // then
    expect(result.status).toBe(401)
  });

  it('should be able to deposit the amount if it is less than 25% his total of jobs to pay', async () => {
    // given
    const clientBeforePayment = await Profile.findByPk(2);
    const amount = 20;

    // when
    const result = await supertest(app).post('/balances/deposit/2').set('profile_id', '2').send({amount});

    // then 
    const clientAfterPayment = await Profile.findByPk(2);
    expect(result.status).toBe(200)
    expect(clientBeforePayment.balance + amount).toBe(clientAfterPayment.balance)
  });

  it('should return 422 the deposit amount more than 25% his total of jobs to pay', async () => {
    // given
    const clientBeforePayment = await Profile.findByPk(2);
    const amount = 100; // amount which is more than 25% of job sum

    // when
    const result = await supertest(app).post('/balances/deposit/2').set('profile_id', '2').send({amount});

    // then 
    const clientAfterPayment = await Profile.findByPk(2);
    expect(result.status).toBe(422)
    expect(clientBeforePayment.balance).toBe(clientAfterPayment.balance)
  });
})

describe("Profiles /admin/best-profession", () => {
  beforeEach(async () => {
    await Profile.sync({ force: true });
    await Contract.sync({ force: true });
    await Job.sync({ force: true });
    await fillTheDb2();
  });

  afterEach(async () => { });

  it('should throw Unauthorized Exception on missing profile id', async () => {
    // given

    // when
    const bestProfession = await supertest(app).get('/admin/best-profession');

    // then
    expect(bestProfession.status).toBe(401)
  });

  it('should throw Unauthorized Exception on incompatible profile id', async () => {
    // given

    // when
    const bestProfession = await supertest(app).get('/admin/best-profession').set('profile_id', '10');

    // then
    expect(bestProfession.status).toBe(401)
  });

  it('should find best profession', async () => {
    // given
    const start = '2020-08-15T19:10:26.737Z';
    const end = '2020-08-30T23:11:26.737Z';

    // when
    const bestProfession = await supertest(app).get('/admin/best-profession')
                                                .set('profile_id', '2').query({ start, end });
    // then 
    expect(bestProfession.status).toBe(200);
    expect(bestProfession.text).toBe(JSON.stringify({"best-profession":"Programmer"}))
  });

  it('should throw 400 if date is invalid', async () => {
    // given
    const start = '2020-08-15T19:99:26.737Z'; // invalid date
    const end = '2020-08-30T23:11:26.737Z';

    // when
    const bestProfession = await supertest(app).get('/admin/best-profession')
                                                .set('profile_id', '2').query({ start, end });
    // then 
    expect(bestProfession.status).toBe(400);
  });

  it('should throw 400 if start date earlier than end date', async () => {
    // given
    const start = '2020-08-30T23:11:26.737Z';
    const end = '2020-08-15T19:99:26.737Z'; 

    // when
    const bestProfession = await supertest(app).get('/admin/best-profession')
                                                .set('profile_id', '2').query({ start, end });
    // then 
    expect(bestProfession.status).toBe(400);
  });

})




describe("Profiles /admin/best-clients", () => {
  beforeEach(async () => {
    await Profile.sync({ force: true });
    await Contract.sync({ force: true });
    await Job.sync({ force: true });
    await fillTheDb2();
  });

  afterEach(async () => { });

  it('should throw Unauthorized Exception on missing profile id', async () => {
    // given

    // when
    const bestClients = await supertest(app).get('/admin/best-clients');

    // then
    expect(bestClients.status).toBe(401)
  });

  it('should throw Unauthorized Exception on incompatible profile id', async () => {
    // given

    // when
    const bestClients = await supertest(app).get('/admin/best-clients').set('profile_id', '10');

    // then
    expect(bestClients.status).toBe(401)
  });

  it('should find best clients', async () => {
    // given
    const start = '2020-08-15T19:10:26.737Z';
    const end = '2020-08-30T23:11:26.737Z';

    // when
    const bestClients = await supertest(app).get('/admin/best-clients')
                                                .set('profile_id', '2').query({ start, end });
    // then 
    const expected = [{"id": 4, "fullName": "Ash Kethcum", "paid": 2020},
                      {"id": 1, "fullName": "Harry Potter", "paid": 421}];
    expect(bestClients.status).toBe(200);
    expect(bestClients.text).toBe(JSON.stringify(expected))
  });

  it('should throw 400 if date is invalid', async () => {
    // given
    const start = '2020-08-15T19:99:26.737Z'; // invalid date
    const end = '2020-08-30T23:11:26.737Z';

    // when
    const bestClients = await supertest(app).get('/admin/best-clients')
                                                .set('profile_id', '2').query({ start, end });
    // then 
    expect(bestClients.status).toBe(400);
  });

  it('should throw 400 if start date earlier than end date', async () => {
    // given
    const start = '2020-08-30T23:11:26.737Z';
    const end = '2020-08-15T19:99:26.737Z'; 

    // when
    const bestClients = await supertest(app).get('/admin/best-clients')
                                                .set('profile_id', '2').query({ start, end });
    // then 
    expect(bestClients.status).toBe(400);
  });
})