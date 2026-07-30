export function mapCategoryRow(row) {
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
    };
}
export function mapThreadDetailRow(row) {
    return {
        id: row.id,
        title: row.title,
        body: row.body,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        category: {
            slug: row.category_slug,
            name: row.category_name,
        },
        author: {
            displayName: row.author_display_name,
            handle: row.author_handle,
        },
    };
}
export function mapThreadSummaryRow(row) {
    return {
        id: row.id,
        title: row.title,
        excerpt: row.excerpt,
        createdAt: row.created_at,
        category: {
            slug: row.category_slug,
            name: row.category_name,
        },
        author: {
            displayName: row.author_display_name,
            handle: row.author_handle,
        },
    };
}
