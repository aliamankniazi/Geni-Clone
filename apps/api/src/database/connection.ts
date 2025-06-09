import neo4j from 'neo4j-driver';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { config } from '../config';

let neo4jDriver: any;
let pgPool: Pool;

export const connectDatabase = async () => {
  try {
    // Connect to Neo4j
    if (config.NEO4J_URI) {
      neo4jDriver = neo4j.driver(
        config.NEO4J_URI,
        neo4j.auth.basic(config.NEO4J_USERNAME, config.NEO4J_PASSWORD)
      );
      
      // Verify connection
      await neo4jDriver.verifyConnectivity();
      logger.info('Connected to Neo4j database');
    } else {
      logger.warn('Neo4j URI not configured, skipping connection');
    }

    // Connect to PostgreSQL
    if (config.DATABASE_URL) {
      pgPool = new Pool({
        connectionString: config.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      
      // Verify connection
      await pgPool.query('SELECT NOW()');
      logger.info('Connected to PostgreSQL database');
    } else {
      logger.warn('PostgreSQL DATABASE_URL not configured, skipping connection');
    }

    return { neo4jDriver, pgPool };
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
};

export const getNeo4jDriver = () => neo4jDriver;
export const getPgPool = () => pgPool;

export const closeDatabaseConnections = async () => {
  try {
    if (neo4jDriver) {
      await neo4jDriver.close();
      logger.info('Neo4j connection closed');
    }
    
    if (pgPool) {
      await pgPool.end();
      logger.info('PostgreSQL connection closed');
    }
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
}; 