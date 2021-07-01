const express = require('express')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const config = require('./config.js')
const admin = require("firebase-admin")

const serviceAccount = require("E:/curawella-task/curawella-e8ce8-firebase-adminsdk-udwnl-06fb0be2fa.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.databaseURL
})

const app = express()

app.use(express.json())
app.use(express.static('public'))

const database = admin.database()

const doctorsRef = database.ref('/Doctors')
const repetitionRef = database.ref('/Repetition')
const appointmentsRef = database.ref('/appointments')

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Task APIs',
      version: '1.0.0'
    }
  },
  apis: ['server.js'],
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))

/**
* @swagger
* /doctors/:uid:
*   get:
*     description: GET doctor's session duration
*     responses:
*       201:
*         description: Success
*/
app.get('/doctors/:uid', async (req, res) => {
  try {
    const sessionDuration = await doctorsRef.child(req.params.uid).child("session").get()

    if (sessionDuration.exists()) {
      res.json(sessionDuration.val())
    } else {
      res.send("Not found")
    }

  } catch (error) {
    console.error(error)
  }
})

/**
* @swagger
* /doctors/:uid:
*   put:
*    description: Update doctor's session duration
*    parameters:
*    - session: title
*      description: session duration
*      required: true
*      type: Nimber
*    responses:
*     200:
*       description: Success
*/
app.put('/doctors/:uid', async (req, res) => {
  const newDuration = {
    session: req.body.session
  }
  try {
    const sessionDuration = await doctorsRef.child(req.params.uid).child("session").get()
    if (sessionDuration.exists()) {
      await doctorsRef.child(req.params.uid).update(newDuration)
      res.status(200).json('updated succesfully')
    } else {
      res.send("Not found")
    }

  } catch (error) {
    console.error(error)
  }
})


/** 
* @swagger
* /appointments:
*   post:
*    description: Create new appointment
*    parameters:
*    - patient: title
*      description: patientId
*      required: true
*      type: String
*    - corona: title
*      description: corona
*      required: true
*      type: Boolean
*    - orderID: title
*      description: orderID
*      required: true
*      type: Number
*    - packageName: title
*      description: package Name
*      required: true
*      type: String
*    - patName: title
*      description: patName
*      required: true
*      type: String
*    - paymentMethod: title
*      description: Patient name
*      required: true
*      type: String
*    - status: title
*      description: Patient name
*      required: true
*      type: String
*    responses:
*      201:
*       description: booked successfuly
*       
*/
app.post('/appointments', async (req, res) => {
  try {
    await appointmentsRef.child(req.params.uid).child().set({
      Patient: req.body.Patient, //hashed
      corona: req.body.corona,
      orderID: req.body.orderID,
      packageName: req.body.packageName,
      patName: req.body.patName,
      paymentMethod: req.body.paymentMethod,
      status: req.body.status,
      type: req.body.type
    })
    res.status(201).send('booked successfully')
  } catch (error) {
    res.status(400).send(error.message)
  }
})



/**
* @swagger
* /durations/uid:
*  put:
*    description: activate/deactivate durations
*    responses:
*      201:
*        description: Success
*/
app.put('/durations/:uid', async (req, res) => {
  const ref = repetitionRef.child(req.params.uid).child(req.body.dayNum).child(req.body.durationTime)
  await ref.child("active").get().then((snapshot) => {
    if (snapshot.exists() && snapshot.val() === true) {
      ref.update({ active: false })
      res.status(201).send('deactivate durations successfully')
    }
    else if (snapshot.exists() && snapshot.val() === false) {
      ref.update({ active: true })
      res.status(201).send('activate durations successfully')
    }
    else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  })
})


/**
* @swagger
* /:
*   get:
*     description: default page
*     responses:
*       200:
*         description: Success
*/
app.get('/', (req, res) => {
  res.send('index')
})

const PORT = 5000

app.listen(PORT, () =>
  console.log('App is listening on port ' + PORT))