const express = require('express')
const { Sequelize, DataTypes } = require('sequelize')
const cors = require('cors')

const sequelize = new Sequelize('clusters', 'test', '2023', {
  host: 'localhost',
  dialect: 'mysql',
})

// Create an instance of Sequelize and define the model
const Clusters = sequelize.define('clusters', {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  percentage: {
    type: DataTypes.STRING,
    allowNull: true,
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
app.use(cors())

// Define the route to fetch all clusters
app.get('/clusters', (req, res) => {
  Clusters.findAll()
    .then(clusters => {
      res.json(clusters)
    })
    .catch(error => {
      console.error('Error fetching clusters:', error)
      res.status(500).json({ error: 'Internal server error' })
    })
})

// Define the route to create a new cluster
// app.post('/clusters', (req, res) => {
//   const { name, percentage } = req.body
//   Clusters.create({ name, percentage })
//     .then(cluster => {
//       res.json(cluster)
//     })
//     .catch(error => {
//       console.error('Error creating cluster:', error)
//       res.status(500).json({ error: 'Internal server error' })
//     })
// })
// ...

// Define the route to create a new cluster
app.post('/clusters', async (req, res) => {
  try {
    await Clusters.destroy({ truncate: true })
    console.log('All records in the clusters table deleted')

    const data = req.body

    if (!Array.isArray(data)) {
      res.status(400).json({ error: 'Invalid data format. Expected an array.' })
      return
    }

    const createPromises = data.map(cluster => {
      const { name, percentage } = cluster
      return Clusters.create({ name, percentage })
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
