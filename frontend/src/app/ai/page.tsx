// "use client";

// import { useMemo, useState } from "react";
// import { useAuth } from "@clerk/nextjs";

// import { createBrowserApiClient } from "@/lib/api-client";
// import { askAssistant } from "@/lib/ai";
// import AIChatInput from "@/components/ai/AIChatInput";

// export default function AIPage() {
//   const { getToken } = useAuth();

//   const apiClient = useMemo(
//     () => createBrowserApiClient(getToken),
//     [getToken]
//   );
//   const [question, setQuestion] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit() {
//   if (question.trim().length < 3) return;

//   try {
//     setLoading(true);

//     const result = await askAssistant(
//       apiClient,
//       question
//     );

//     console.log(result);
//   } catch (error) {
//     console.error(error);
//   } finally {
//     setLoading(false);
//   }
// }

//   return (
//     <main className="container mx-auto px-4 py-10">
//       <AIChatInput
//         value={question}
//         loading={loading}
//         onChange={setQuestion}
//         onSubmit={handleSubmit}
//       />
//     </main>
//   );
// }