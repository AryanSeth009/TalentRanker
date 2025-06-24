import { MongoClient, type Db, MongoClientOptions } from "mongodb"

// Validate environment variable
if (!process.env.MONGODB_URI) {
  const error = new Error('Invalid/Missing environment variable: "MONGODB_URI"')
  console.error(error.message)
  throw error
}

// Log the connection string (with password masked for security)
const maskedUri = process.env.MONGODB_URI.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+@/, '$1****@')
console.log('Connecting to MongoDB at:', maskedUri)

const uri = process.env.MONGODB_URI
const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 10000,
  retryWrites: true,
  w: 'majority',
  retryReads: true,
  maxPoolSize: 10,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  // Let the connection string handle auth
  authMechanism: 'DEFAULT',
  // Add direct connection for better error reporting
  directConnection: false,
  // Enable command monitoring for debugging
  monitorCommands: true,
  // Set the server API version
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    try {
      console.log('Creating new MongoDB connection...')
      client = new MongoClient(uri, options)
      
      // Handle connection events
      client.on('serverOpening', () => console.log('MongoDB: Server opening'))
      client.on('serverClosed', () => console.log('MongoDB: Server closed'))
      client.on('topologyOpening', () => console.log('MongoDB: Topology opening'))
      client.on('topologyClosed', () => console.log('MongoDB: Topology closed'))
      client.on('error', (err) => console.error('MongoDB connection error:', err))
      
      globalWithMongo._mongoClientPromise = (async () => {
        try {
          await client.connect()
          console.log('MongoDB connected successfully')
          return client
        } catch (err) {
          console.error('MongoDB connection failed:', err)
          throw err
        }
      })()
    } catch (error) {
      console.error('Failed to create MongoDB client:', error)
      throw error
    }
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise
    // Test the connection with a ping
    await client.db().admin().ping()
    console.log('Successfully connected to MongoDB')
    
    // Get the database name from the connection string or use default
    const dbName = new URL(uri).pathname.replace(/^\/+/, '') || 'hirely-ai'
    console.log('Using database:', dbName)
    
    return client.db(dbName)
  } catch (error) {
    console.error('Failed to connect to MongoDB:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      timestamp: new Date().toISOString(),
      connectionString: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+@/, '$1****@') : 
        'Not configured'
    })
    
    throw new Error('Failed to connect to MongoDB. Please check your connection string and ensure your IP is whitelisted in MongoDB Atlas.')
  }
}

export default clientPromise
