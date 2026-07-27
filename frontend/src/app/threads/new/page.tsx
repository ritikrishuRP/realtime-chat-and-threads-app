"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { duplicateCheck } from "@/lib/ai";
import { apiGet, createBrowserApiClient } from "@/lib/api-client";
import { Category, ThreadDetail } from "@/types/thread";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const NewThreadSchema = z.object({
  title: z.string().trim().min(5, "Title is too short"),
  body: z.string().trim().min(15, "Body is too short"),
  categorySlug: z.string().trim().min(1, "Category is required"),
});

type NewThreadFormValues = z.infer<typeof NewThreadSchema>;

type DuplicateThread = {
  id: number;
  title: string;
  body: string;
  distance: number;
};

type DuplicateCheckResult = {
  isDuplicate: boolean;
  similarThread: DuplicateThread | null;
};

function NewThreadsPage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const apiClient = useMemo(() => createBrowserApiClient(getToken), [getToken]);

const [categories, setCategories] = useState<Category[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

const [duplicateResult, setDuplicateResult] =
  useState<DuplicateCheckResult | null>(null);

const [checkingDuplicate, setCheckingDuplicate] =
  useState(false);

  const form = useForm<NewThreadFormValues>({
    resolver: zodResolver(NewThreadSchema),
    defaultValues: {
      title: "",
      body: "",
      categorySlug: "",
    },
  });

  const title = form.watch("title");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);

      try {
        const extractCats = await apiGet<Category[]>(
          apiClient,
          "/api/threads/categories"
        );

        if (!isMounted) return;

        setCategories(extractCats);

        if (extractCats.length > 0) {
          form.setValue("categorySlug", extractCats[0]?.slug);
        }
      } catch (e) {
        console.log(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
  }, [apiClient, form]);

  useEffect(() => {
    if (isSubmitting) return;
  if (!title || title.trim().length < 10) {
    setDuplicateResult(null);
    return;
  }

  const timeout = setTimeout(async () => {
    try {
      setCheckingDuplicate(true);

      const result = await duplicateCheck(
        apiClient,
        title.trim()
      );

      console.log("Duplicate Check Result:", result);

      setDuplicateResult(result);
    } catch (err) {
      console.error(err);
      setDuplicateResult(null);
      // toast.error("AI duplicate detection is temporarily unavailable.");

    } finally {
      setCheckingDuplicate(false);
    }
  }, 600);

  return () => clearTimeout(timeout);
}, [title, apiClient]);

  async function onThreadSubmit(values: NewThreadFormValues) {
    try {
      setIsSubmitting(true);
      // try to add a new method in apiclient file -> apiPost
      const response = await apiClient.post("/api/threads/threads", {
        title: values.title,
        body: values.body,
        categorySlug: values.categorySlug,
      });

      const created = response?.data?.data as ThreadDetail;

      toast.success("New thread created successfully!", {
        description: "Your thread is now live!",
      });

      setDuplicateResult(null);
      // router.push("/");
      router.push(`/threads/${created?.id}`);
    } catch (e) {
      console.log(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Start a new thread
        </h1>
      </div>

      <Card className="border-border/70 bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            Thread Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onThreadSubmit)}
            className="space-y-6"
          >
            <div className="space-y-2">
  <label
    className="text-sm font-semibold text-foreground"
    htmlFor="title"
  >
    Thread Title
  </label>

  <Input
    id="title"
    placeholder="Thread Title..."
    {...form.register("title")}
    disabled={isLoading || isSubmitting}
    className="border-border mt-3 bg-background/70 text-sm"
  />

  {checkingDuplicate && (
    <Card className="mt-4 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
      <CardContent className="py-4">
        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>✨ AI is checking for similar discussions...</span>
        </div>
      </CardContent>
    </Card>
  )}

  {!checkingDuplicate &&
    duplicateResult?.isDuplicate &&
    duplicateResult.similarThread && (
      <Card className="mt-4 border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-amber-700 dark:text-amber-300">
            ⚠ Similar Discussion Found
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold text-foreground">
              {duplicateResult.similarThread.title}
            </h3>

            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {duplicateResult.similarThread.body}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              AI detected a very similar discussion.
            </span>

            <Button asChild size="sm" variant="outline">
              <Link
                href={`/threads/${duplicateResult.similarThread.id}`}
              >
                View Discussion
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )}
</div>

            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-foreground"
                htmlFor="categorySlug"
              >
                Category
              </label>
              <select
                id="categorySlug"
                {...form.register("categorySlug")}
                disabled={isLoading || isSubmitting}
                className="h-10 mt-3 w-full rounded-md border border-border bg-background/70 px-3 text-sm text-foreground focus:outline focus:ring-2 focus:ring-primary/30"
              >
                {categories.map((category) => (
                  <option
                    value={category.slug}
                    id={category.slug}
                    key={category.slug}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-foreground"
                htmlFor="body"
              >
                Description
              </label>
              <Textarea
                id="body"
                rows={8}
                placeholder="Thread description..."
                disabled={isLoading || isSubmitting}
                className="border-border mt-3 bg-background/70 text-sm"
                {...form.register("body")}
              />
            </div>
            <CardFooter className="flex justify-end border-t border-border px-0 pt-5">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? "Submitting..." : "Publish Thread"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default NewThreadsPage;
