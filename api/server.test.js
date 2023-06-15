const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server.js')

beforeAll(async () => {
  await db.migrate.rollback() // so any changes to migration files are picked up
  await db.migrate.latest()
})

beforeEach(async () => {
  await db('users').truncate()
})

afterAll(async () => {
  await db.destroy()
})


// Write your tests here
test('sanity', () => {
  expect(true).toBe(true)
})

describe('server.js', () => {
  it('should set testing environment', () => {
    expect(process.env.NODE_ENV).toBe('testing')
  })

})

describe('[post] /register', () => {
  const userNew = { username: 'Bruce', password: '0000'}
  it('responds with empty array of users', async () => {
    await request(server).get('/api/auth/register')
    const dataRow = await db('users')
    expect(dataRow).toHaveLength(0)
  })
  it('user has registered correctly' , async () => {
    await request(server).post('/api/auth/register').send(userNew);
    const dataRow = await db('users')
    expect(dataRow).toHaveLength(1)
  })
  it('sends back username and password which has been hashed', async() => {
    const res = await request(server).post('/api/auth/register').send(userNew)
    expect(res.body.username).toMatch(userNew.username)
  })
})

describe('[post] / login', () => {
  const userNew = { username: 'Bruce', password: '0000'}
  it('username entered correctly but password entered incorrectly ', async () => {
     await request(server).post('/api/auth/register').send(userNew)
     const response = await request(server).post('/api/auth/login').send({ username: userNew.username, password: '3445'})
     expect(response.status).toBe(401)
     expect(response.body.message).toBe('invalid credentials')
     
  })
  it('username and password entered correctly', async () => {
    await request(server).post('/api/auth/register').send(userNew)
    const response = await request(server).post('/api/auth/login').send({ username: userNew.username, password: userNew.password})
    expect(response.status).toBe(200)

  })
  it('token received', async () => {
    await request(server).post('/api/auth/register').send(userNew)
    const response = await request(server).post('/api/auth/login').send(userNew)
    expect(response.body.token).toBeDefined()
    
  })

})




