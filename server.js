const express = require('express')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const config = require('./config.js')
const admin = require("firebase-admin")

var serviceAccount = require("E:/curawella-task/curawella-e8ce8-firebase-adminsdk-udwnl-06fb0be2fa.json")

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
      title: 'Task Library API',
      version: '1.0.0'
    }
  },
  apis: ['server.js'],
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))

/*
* @swagger
* /doctors:
*   get:
*     description: GET doctor's session duration    
*/
app.get('/doctors/:key', async (req, res) => {
  await doctorsRef.child(req.params.key).child("session").get().then((snapshot) => {
    if (snapshot.exists()) {
      res.send(snapshot.val())
    } else {
      res.send("No data available")
    }
  }).catch((error) => {
    console.error(error)
  })
})

/*
* @swagger
* /doctors:
*   put:
*     description: UPDATE doctor's session duration    
*/
app.put('/doctors/:key', async (req, res) => {
  const newduration = req.body.session
  await doctorsRef.child(req.params.key).child("session").get().then((snapshot) => {
    if (snapshot.exists()) {
      snapshot.val().update(newduration)
      res.send(snapshot.val())
    } else {
      res.status(404).send("No data available")
    }
  }).catch((error) => {
    console.error(error)
  })
})


/*
* @swagger
* /appointments:
*   post:
*     description: CREATE new appointment
*     paramaters:
*      - Patient
*        corona
*        orderID
*        packageName
*        patName
*        paymentMethod
*        status
*        type
*
*       
*/
app.post('/appointments', async (req, res) => {
  try {
    const pid = appointmentsRef.push().key
    await appointmentsRef.child(pid).child(req.body.appointment_id).set({
      Patient: req.body.Patient, //hashed
      corona: req.body.corona,
      orderID: req.body.orderID,
      packageName: req.body.packageName,
      patName: req.body.patName,
      paymentMethod: req.body.paymentMethod,
      status: req.body.status,
      type: req.body.type
    })
    res.send('booked successfuly')
  } catch (error) {
    res.status(400).send(error.message)
  }
})

// activate/deactivate durations
app.put('/durations', async (req, res) => {
  await repetitionRef.child(req.body.uid).child(req.body.UTC).child(req.body.UTCS).child("active").get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.val().update(req.body.active)
        res.send(snapshot.val())
      } else {
        res.status(404).send("No data available")
      }
    }).catch((error) => {
      console.error(error)
    })
})


/*
* @swagger
* /:
*   get:
*     description: defualt page    
*       
*/
app.get('/', (req, res) => {
  res.send('index')
})

app.listen(config.port, () =>
  console.log('App is listening on port ' + config.port))