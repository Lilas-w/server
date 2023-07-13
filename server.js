const express = require('express')
const { Sequelize, DataTypes } = require('sequelize')
const cors = require('cors')

const sequelize = new Sequelize('clusters', 'test', '2023', {
  host: 'localhost',
  dialect: 'mysql',
})

// Create an instance of Sequelize and define the model
const Clusters = sequelize.define('clusters', {
  sessionID: {
    type: DataTypes.STRING,
    allowNull: false,
  },
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
  .sync({ force: true })
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

// Define the route to generate a session ID
app.get('/session', (req, res) => {
  const sessionID = generateSessionID()

  res.json({ sessionID })
})

// Define the route to fetch clusters for a specific session
app.get('/clusters/:sessionID', (req, res) => {
  const sessionID = req.params.sessionID

  Clusters.findAll({ where: { sessionID } })
    .then(clusters => {
      res.json(clusters)
    })
    .catch(error => {
      console.error('Error fetching clusters:', error)
      res.status(500).json({ error: 'Internal server error' })
    })
})

// Define the route to create a new cluster
app.post('/clusters', async (req, res) => {
  try {
    const { sessionID, data } = req.body;

    if (!sessionID || !Array.isArray(data)) {
      res
        .status(400)
        .json({ error: 'Invalid request. Expected sessionID and data.' })
      return;
    }

    await Clusters.destroy({ where: { sessionID } });
    console.log(
      `All records in the clusters table deleted for session: ${sessionID}`,
    )

    const createPromises = data.map(cluster => {
      return Clusters.create({
        sessionID,
        name: cluster.name,
        percentage: cluster.percentage,
      });
    });

    const createdClusters = await Promise.all(createPromises);

    res.json(createdClusters);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Cluster name must be unique' });
    } else {
      console.error('Error creating clusters:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000')
})

function generateSessionID() {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0')
  return timestamp + random
}
