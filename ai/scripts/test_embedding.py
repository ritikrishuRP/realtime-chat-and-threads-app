from services.embedding_service import embedding_service


def main():
    text = "How do I deploy my Next.js application on AWS?"

    embedding = embedding_service.generate_embedding(text)

    print(f"Embedding dimension: {len(embedding)}")

    print()

    print("First 10 values:")

    print(embedding[:10])


if __name__ == "__main__":
    main()