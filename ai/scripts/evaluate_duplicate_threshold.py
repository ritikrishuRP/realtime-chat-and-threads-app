from services.search_service import semantic_search


TEST_QUERIES = [
    "How do I deploy Next.js on AWS?",
    "Which EC2 instance should I use?",
    "How do I configure HTTPS for S3?",
    "How can I optimize Docker builds?",
    "How do I reduce Next.js cold starts?",
]


THRESHOLDS = [
    0.20,
    0.25,
    0.30,
    0.35,
    0.40,
    0.45,
]


def main():

    print("\n===== Duplicate Threshold Evaluation =====\n")

    for threshold in THRESHOLDS:

        duplicate_count = 0

        print(f"\nThreshold: {threshold:.2f}")

        for query in TEST_QUERIES:

            results = semantic_search(
                query=query,
                limit=1,
            )

            if not results:
                continue

            distance = results[0]["distance"]

            is_duplicate = distance <= threshold

            if is_duplicate:
                duplicate_count += 1

            print(
                f"{query[:45]:45}"
                f" Distance={distance:.3f}"
                f" Duplicate={is_duplicate}"
            )

        print(f"\nDuplicates Found: {duplicate_count}")
        print("-" * 60)


if __name__ == "__main__":
    main()