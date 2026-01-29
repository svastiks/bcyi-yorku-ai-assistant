"""MongoDB connection and utilities"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import MongoClient
from app.config import settings
from typing import Optional


class MongoDB:
    """MongoDB connection manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    
    @classmethod
    async def connect(cls):
        """Connect to MongoDB"""
        if cls.client is None:
            cls.client = AsyncIOMotorClient(settings.mongodb_uri)
            cls.db = cls.client[settings.database_name]
            print(f"Connected to MongoDB: {settings.database_name}")
    
    @classmethod
    async def close(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            cls.client = None
            cls.db = None
            print("MongoDB connection closed")
    
    @classmethod
    def get_database(cls) -> AsyncIOMotorDatabase:
        """Get database instance"""
        if cls.db is None:
            raise RuntimeError("Database not connected. Call MongoDB.connect() first.")
        return cls.db
    
    @classmethod
    async def get_collection(cls, collection_name: str):
        """Get a collection from the database"""
        db = cls.get_database()
        return db[collection_name]


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance"""
    return MongoDB.get_database()


# Synchronous client for non-async operations
def get_sync_client():
    """Get synchronous MongoDB client"""
    return MongoClient(settings.mongodb_uri)


def get_sync_database():
    """Get synchronous database instance"""
    client = get_sync_client()
    return client[settings.database_name]
