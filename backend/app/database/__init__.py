"""Database module"""
from app.database.mongodb import MongoDB, get_database

__all__ = ["MongoDB", "get_database"]
