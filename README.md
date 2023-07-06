# Server

Server is a RESTful API for FOODIE-browser built using the Express framework that allows users to fetch and create clusters. It follows the principles of using standard HTTP methods (GET, POST) to perform actions on resources.

## Getting Started

To get started with the application, follow these steps:

1. Clone the jbrowse-component repository: `git clone https://github.com/your-repo-url.git`
2. Navigate to the server submodule: `cd jbrowse-component/server`
3. Install the dependencies: `npm install`
3. Configure the MySQL database connection in the `server.js` file.
4. Start the server: `node server.js`

## API Endpoints

### Fetch All Clusters

This endpoint retrieves all clusters from the database.

- **URL**: `/clusters`
- **Method**: `GET`
- **Request Body**: None
- **Success Response**: 
    - **Code**: 200
    - **Content**: JSON array containing all clusters
- **Error Response**:
    - **Code**: 500
    - **Content**: JSON object with the error message

### Create New Clusters

This endpoint creates new clusters in the database. It first deletes all existing records in the "clusters" table, validates the request body data, and then inserts new records for each cluster.

- **URL**: `/clusters`
- **Method**: `POST`
- **Request Body**: JSON array containing the clusters data
- **Success Response**: 
    - **Code**: 200
    - **Content**: JSON array containing the created clusters
- **Error Response**:
    - **Code**: 400
    - **Content**: JSON object with the error message (e.g., invalid data format)
    - **Code**: 500
    - **Content**: JSON object with the error message

## Implementation Details

The Sequelize package is used to interact with the MySQL database, define the model for the "clusters" table, and perform database operations. 

The Express framework is used to handle HTTP requests and define the API endpoints.

Please note that you need to configure the MySQL database connection and install the necessary dependencies before running the application.

Feel free to explore and interact with the API endpoints to fetch and create clusters!
