import { Type } from "@google/genai";

export const datasetSchema = {
  type: Type.ARRAY,

  items: {
    type: Type.OBJECT,

    properties: {
      category: {
        type: Type.STRING,
        enum: ["General", "Q&A", "Help", "Showcase"],
      },

      title: {
        type: Type.STRING,
      },

      body: {
        type: Type.STRING,
      },

      replies: {
        type: Type.ARRAY,

        items: {
          type: Type.OBJECT,

          properties: {
            body: {
              type: Type.STRING,
            },
          },

          required: ["body"],
        },
      },
    },

    required: [
      "category",
      "title",
      "body",
      "replies",
    ],
  },
};