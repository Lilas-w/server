const express = require('express')
const { Sequelize, DataTypes } = require('sequelize')
const cors = require('cors')
const session = require('express-session')
const cookieParser = require('cookie-parser')

const sequelize = new Sequelize('clusters', 'test', '2023', {
  host: 'localhost',
  dialect: 'mysql',
})

// Create an instance of Sequelize and define the model
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

// Sync the database and handle any errors
sequelize
  .sync()
  .then(() => {
    console.log('Database synchronized')
  })
  .catch(error => {
    console.error('Error synchronizing database:', error)
  })

// Create an Express app and enable JSON parsing
const app = express()
app.use(express.json())
app.use(
  cors({
    origin: 'http://localhost:3001', // Set the allowed origin
    credentials: true, // Enable sending cookies and other credentials with the request
  }),
)
app.use(cookieParser())

// Setup express-session middleware
app.use(
  session({
    secret: '5c3dde296f96025304c4ed60ef06b5fc2b6584d2fd1d1595ff6a930d0f5b52e1',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }, // Set the cookie properties
  }),
)

// Define the route to fetch all clusters
app.get('/clusters', (req, res) => {
  const sessionId = req.session.id
  Clusters.findAll({ where: { sessionId } })
    .then(clusters => {
      res.json(clusters)
    })
    .catch(error => {
      console.error('Error fetching clusters:', error)
      res.status(500).json({ error: 'Internal server error' })
    })
})

app.post('/clusters', async (req, res) => {
  try {
    const sessionId = req.session.id

    // Delete all records from the clusters table
    await Clusters.destroy({ truncate: true })

    console.log('All records in the clusters table deleted')

    const data = req.body

    if (!Array.isArray(data)) {
      res.status(400).json({ error: 'Invalid data format. Expected an array.' })
      return
    }

    const createPromises = data.map(cluster => {
      const { name, percentage } = cluster
      return Clusters.create({ name, percentage, sessionId })
    })

    const createdClusters = await Promise.all(createPromises)
    res.json(createdClusters)
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
