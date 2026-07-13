from pgvector import Vector
from psycopg.rows import dict_row

from app.database import get_db_connection


def search_similar_threads(
    query_embedding: list[float],
    limit: int = 5,
):
    connection = get_db_connection()

    try:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                SELECT
                    t.id,
                    t.title,
                    t.body,
                    te.embedding <=> %s AS distance
                FROM thread_embeddings te
                JOIN threads t
                    ON te.thread_id = t.id
                ORDER BY distance ASC
                LIMIT %s;
                """,
                (
                    Vector(query_embedding),
                    limit,
                ),
            )

            return cursor.fetchall()

    finally:
        connection.close()


def get_thread_embedding(
    thread_id: int,
) -> list[float] | None:
    """
    Fetch the stored embedding for a thread.
    Returns None if the thread has no embedding.
    """

    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT embedding
                FROM thread_embeddings
                WHERE thread_id = %s;
                """,
                (thread_id,),
            )

            row = cursor.fetchone()

            if row is None:
                return None

            return row[0].to_list()

    finally:
        connection.close()