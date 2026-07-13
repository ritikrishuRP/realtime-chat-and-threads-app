from psycopg.rows import dict_row

from app.database import get_db_connection


def get_thread_for_summary(
    thread_id: int,
):
    """
    Fetch a thread together with all of its replies.
    """

    connection = get_db_connection()

    try:
        with connection.cursor(
            row_factory=dict_row,
        ) as cursor:

            cursor.execute(
                """
                SELECT
                    t.id,
                    t.title,
                    t.body
                FROM threads t
                WHERE t.id = %s;
                """,
                (thread_id,),
            )

            thread = cursor.fetchone()

            if thread is None:
                return None

            cursor.execute(
                """
                SELECT
                    body
                FROM replies
                WHERE thread_id = %s
                ORDER BY created_at ASC;
                """,
                (thread_id,),
            )

            replies = cursor.fetchall()

            return {
                "thread": thread,
                "replies": replies,
            }

    finally:
        connection.close()