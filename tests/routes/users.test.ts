import request from 'supertest'
import app from "../app.test";
import Patients from "../../src/schemas/PatientSchema"
import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import PatientController from '../../src/controllers/patient.ctl';
const patients = new PatientController();


const mockRequest = (patient : any) => {
  let req = {} as any
  req.user = {
    _id: patient._id,
    role: patient.role
  }
  req.body = jest.fn().mockReturnValue(req)
  req.params = jest.fn().mockReturnValue(req)
  return req
};

const mockResponse = () => {
  let res = {} as any
  res.send = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
};

async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections)
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName]
    await collection.deleteMany({})
  }
}

jest.setTimeout(20000);

let mongoServer: MongoMemoryServer;

let connection: any;
let db: any;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) console.error(err);
  });
});

//TODO Create inBetween function to drop all documents from db for tests to be independent
// Cleans up database between each test
afterEach(async () => {
  await removeAllCollections();
})

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  app.close();
});


// const mockPatient = {
//   email: "luiscor@mail",
//   password: "qweasd",
//   name: "Luis Cor",
//   role: "PATIENT",
//   birthDate: "15-12-1995",
//   address: "Rua das Cenas n7",
//   identificationNum: "1234",
//   fiscalNumber: "6346346"
// }

// const mockPatient2 = {
//   email: "otherdude@mail",
//   password: "asdzxc",
//   name: "Other Dude",
//   role: "PATIENT",
//   birthDate: "15-12-2000",
//   address: "Rua da Liberdade lote 1",
//   identificationNum: "47546",
//   fiscalNumber: "786787"
// }

const mockPatient = {
  creationDate: Date.now(),
  role: "PATIENT",
  email: "test@mail.com",
  password: "qweasd",
  name: "TestPatient",
  gender: "male",
  birthDate: "1994-07-08T00:00:00.000Z",
  address: "Rua de Teste Com n23",
  identificationNum: "189328213",
  fiscalNumber: "893489",
  phoneNumber: "917284123"
}

const mockPatient2 = {
  creationDate: Date.now(),
  role: "PATIENT",
  email: "test2@mail.com",
  password: "qweasd",
  name: "TestPatient2",
  gender: "female",
  birthDate: "1993-01-12T00:00:00.000Z",
  address: "Rua de Segundo Teste Com n 53",
  identificationNum: "98732494",
  fiscalNumber: "09436",
  phoneNumber: "920124456"
}

let token: string;

describe('Testing User Routes', () => {

  it('DB Sanity Check', async () => {

    await new Patients(mockPatient).save();
    const count = await Patients.countDocuments();
    expect(count).toEqual(1);

  });

  it('User Login', async () => {
    await new Patients(mockPatient).save();

    const res = await request(app)
      .post('/api/login')
      .query({ email: mockPatient.email })
      .query({ password: mockPatient.password })
      .query({ role: mockPatient.role })
      .send()

    token = res.body.token;

    expect(res.status).toEqual(200);
    expect(token).not.toBeNull();
  })

  it('Requests require auth by token', async () => {
    await new Patients(mockPatient).save();

    const reslogin = await request(app)
      .post('/api/login')
      .query({ email: mockPatient.email })
      .query({ password: mockPatient.password })
      .query({ role: mockPatient.role })
      .send()

    token = reslogin.body.token;


    const res = await request(app)
      .get('/api/patient/profile')

    expect(res.status).toEqual(401)

  });

  it('There is one registered user', async () => {
    await new Patients(mockPatient).save();

    const reslogin = await request(app)
      .post('/api/login')
      .query({ email: mockPatient.email })
      .query({ password: mockPatient.password })
      .query({ role: mockPatient.role })
      .send()

    token = reslogin.body.token;

    const res = await request(app)
      .get('/api/patient/profile')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty("email")
    expect(res.body).toHaveProperty("name")
    expect(res.body).toHaveProperty("role")
    expect(res.body).toHaveProperty("birthDate")
    expect(res.body).toHaveProperty("address")
    expect(res.body).toHaveProperty("identificationNum")
    expect(res.body).toHaveProperty("fiscalNumber")

  });

  it('Registering new user', async () => {
    await new Patients(mockPatient).save();

    const res = await request(app)
      .post('/api/patient')
      .send(mockPatient2)

    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty("email")
    expect(res.body).toHaveProperty("id")

  });


});


describe('Testing Patient Controller', () => {

  it('Get All Patients (1 patient)', async () => {

    var patient = await new Patients(mockPatient).save();

    let req = mockRequest(patient);
    let res = {} as any
    res.send = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)

    await patients.getAllPatients(req, res);

    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty("patients")
    expect(res.body.patients).toHaveProperty("id")

  });

});