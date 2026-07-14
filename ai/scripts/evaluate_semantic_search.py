import json
from pathlib import Path

from services.search_service import semantic_search

DATASET_PATH = (
    Path(__file__).parent.parent
    / "evaluation"
    / "evaluation_dataset.json"
)


def main():
    with open(DATASET_PATH, "r", encoding="utf-8") as file:
        dataset = json.load(file)

    total = len(dataset)

    top1_correct_count = 0
    top5_correct_count = 0

    total_precision = 0.0
    total_recall = 0.0
    total_mrr = 0.0

    print("\n===== Semantic Search Evaluation =====\n")

    for test_case in dataset:

        query = test_case["query"]
        relevant_ids = set(test_case["relevant_thread_ids"])

        results = semantic_search(
            query=query,
            limit=5,
        )

        retrieved_ids = [
            result["id"]
            for result in results
        ]

        top1_correct = (
            len(retrieved_ids) > 0
            and retrieved_ids[0] in relevant_ids
        )

        top5_correct = any(
            thread_id in relevant_ids
            for thread_id in retrieved_ids
        )

        relevant_retrieved = sum(
            1
            for thread_id in retrieved_ids
            if thread_id in relevant_ids
        )

        precision_at_5 = (
            relevant_retrieved / len(retrieved_ids)
            if retrieved_ids
            else 0
        )

        recall_at_5 = (
            relevant_retrieved / len(relevant_ids)
            if relevant_ids
            else 0
        )

        reciprocal_rank = 0.0

        for rank, thread_id in enumerate(
            retrieved_ids,
            start=1,
        ):
            if thread_id in relevant_ids:
                reciprocal_rank = 1 / rank
                break

        if top1_correct:
            top1_correct_count += 1

        if top5_correct:
            top5_correct_count += 1

        total_precision += precision_at_5
        total_recall += recall_at_5
        total_mrr += reciprocal_rank

        print(f"Query              : {query}")
        print(f"Relevant IDs       : {sorted(relevant_ids)}")
        print(f"Retrieved IDs      : {retrieved_ids}")
        print(f"Top-1 Correct      : {top1_correct}")
        print(f"Top-5 Correct      : {top5_correct}")
        print(f"Precision@5        : {precision_at_5:.2f}")
        print(f"Recall@5           : {recall_at_5:.2f}")
        print(f"Reciprocal Rank    : {reciprocal_rank:.2f}")
        print("-" * 60)

    top1_accuracy = (
        top1_correct_count / total
    ) * 100

    top5_accuracy = (
        top5_correct_count / total
    ) * 100

    average_precision = (
        total_precision / total
    ) * 100

    average_recall = (
        total_recall / total
    ) * 100

    mean_reciprocal_rank = (
        total_mrr / total
    )

    print("\n========== Final Report ==========")
    print(f"Top-1 Accuracy : {top1_accuracy:.2f}%")
    print(f"Top-5 Accuracy : {top5_accuracy:.2f}%")
    print(f"Avg Precision@5: {average_precision:.2f}%")
    print(f"Avg Recall@5   : {average_recall:.2f}%")
    print(f"MRR            : {mean_reciprocal_rank:.3f}")


if __name__ == "__main__":
    main()