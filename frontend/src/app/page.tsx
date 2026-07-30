import { Suspense } from "react";
import ThreadsHomePage from "@/components/threads/thread-home";

export default function ThreadsPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <Suspense fallback={<div>Loading...</div>}>
        <ThreadsHomePage />
      </Suspense>
    </div>
  );
}