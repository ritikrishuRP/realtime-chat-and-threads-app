from pgvector.psycopg import register_vector
from psycopg import connect

from app.config import settings


def get_db_connection():
    connection = connect(settings.DATABASE_URL)

    register_vector(connection)

    return connection