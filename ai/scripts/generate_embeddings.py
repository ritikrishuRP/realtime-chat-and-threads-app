from app.database import get_db_connection
from services.embedding_service import embedding_service


def main():
    print("🚀 Starting embedding generation...")

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            SELECT
                t.id,
                t.title,
                t.body
            FROM threads t
            LEFT JOIN thread_embeddings te
                ON t.id = te.thread_id
            WHERE te.thread_id IS NULL
            ORDER BY t.id;
        """)

        threads = cursor.fetchall()

        print(f"📝 Found {len(threads)} threads to process.\n")

        if not threads:
            print("✅ All threads are already indexed.")
            return

        total_threads = len(threads)

        for index, thread in enumerate(threads, start=1):

            thread_id, title, body = thread

            combined_text = (
                f"Title: {title}\n\n"
                f"Content: {body}"
            )

            embedding = embedding_service.generate_embedding(
                combined_text
            )

            cursor.execute(
                """
                INSERT INTO thread_embeddings
                (
                    thread_id,
                    content,
                    embedding
                )
                VALUES
                (
                    %s,
                    %s,
                    %s
                );
                """,
                (
                    thread_id,
                    combined_text,
                    embedding,
                ),
            )

            if index % 25 == 0:
                connection.commit()
                print(f"💾 Batch committed ({index}/{total_threads})")

            print(
                f"✅ Indexed Thread {thread_id} ({index}/{total_threads})"
            )

        connection.commit()

        print("\n🎉 Embedding generation completed successfully!")

    except Exception as error:

        connection.rollback()

        print("❌ Something went wrong!")
        print(error)

    finally:

        cursor.close()
        connection.close()

        print("🔒 Database connection closed.")


if __name__ == "__main__":
    main()