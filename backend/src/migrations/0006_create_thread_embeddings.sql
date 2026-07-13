CREATE TABLE thread_embeddings (
    id BIGSERIAL PRIMARY KEY,

    thread_id BIGINT NOT NULL UNIQUE,

    content TEXT NOT NULL,

    embedding VECTOR(3072) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_thread_embeddings_thread
        FOREIGN KEY (thread_id)
        REFERENCES threads(id)
        ON DELETE CASCADE
);