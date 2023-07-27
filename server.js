const express = require('express')
const { Sequelize, DataTypes } = require('sequelize')
const cors = require('cors')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid')
const MySQLStore = require('express-mysql-session')(session)

const sequelize = new Sequelize('clusters', 'test', '2023', {
  host: 'localhost',
  dialect: 'mysql',
})

const Clusters = sequelize.define('clusters', {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  percentage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sessionId: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
})

sequelize
  .sync()
  .then(() => {
    console.log('Database synchronized')
  })
  .catch(error => {
    console.error('Error synchronizing database:', error)
  })

const app = express()
app.use(express.json())

// Custom session ID generator function
const generateSessionId = () => {
  return uuidv4()
}

const sessionStore = new MySQLStore({
  db: sequelize,
  expiration: 86400000,
  checkExpirationInterval: 900000,
  user: 'test',
  password: '2023',
  database: 'clusters',
})

app.use(
  session({
    name: 'sessionId',
    secret: '5c3dde296f96025304c4ed60ef06b5fc2b6584d2fd1d1595ff6a930d0f5b52e1',
    resave: false,
    saveUninitialized: true, // Change this to true
    cookie: {
      secure: false,
      maxAge: 86400000,
    },
    store: sessionStore,
  }),
)

// Enable CORS after setting up session middleware
app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true, // Enable sending cookies and other credentials with the request
  }),
)

app.get('/clusters', async (req, res) => {
  try {
    // Retrieve only records that have the same sessionId as the client's session
    const clusters = await Clusters.findAll({
      where: { sessionId: req.sessionID }, // Use req.sessionID to retrieve the session ID
    })
    res.json(clusters)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ error: 'An error occurred while fetching data' })
  }
})

app.post('/clusters', async (req, res) => {
  try {
    console.log('Received data from the client:', req.body)
    const sessionId = req.sessionID // Use req.sessionID to get the session ID

    // Delete all records from the clusters table
    await Clusters.destroy({ truncate: true })

    console.log('All records in the clusters table deleted')

    const data = req.body

    if (!Array.isArray(data)) {
      res.status(400).json({ error: 'Invalid data format. Expected an array.' })
      return
    }

    console.log('Received data:', data) // Add this log to see the data received from the client

    const createPromises = data.map(cluster => {
      const { name, percentage } = cluster
      return Clusters.create({ name, percentage, sessionId })
    })

    Promise.all(createPromises)
      .then(createdClusters => {
        console.log('Created clusters:', createdClusters) // Add this log to see the data that is saved to the database
        res.json(createdClusters)
      })
      .catch(error => {
        console.error('Error creating clusters:', error)
        res.status(500).json({ error: 'Internal server error' })
      })
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Cluster name must be unique' })
    } else {
      console.error('Error creating clusters:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000')
})
