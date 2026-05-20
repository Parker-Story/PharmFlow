import Link from "next/link";
import { Upload, BookOpen, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizCard } from "@/components/quiz/quiz-card";
import type { Quiz } from "@/types/database";

export const metadata = { title: "Dashboard — PharmFlow" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rawQuizzes } = await supabase
    .from("quizzes")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(6);
  const quizzes = rawQuizzes as Quiz[] | null;

  const readyCount = quizzes?.filter((q) => q.status === "ready").length ?? 0;
  const totalQuestions =
    quizzes?.reduce((sum, q) => sum + (q.question_count ?? 0), 0) ?? 0;

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hey, {firstName} 👋</h1>
          <p className="text-muted-foreground">
            Ready to quiz yourself on today&apos;s lecture?
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload PDF
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{readyCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Questions Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{totalQuestions}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-accent border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" className="w-full">
              <Link href="/upload">New Quiz</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent quizzes */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Quizzes</h2>
          {(quizzes?.length ?? 0) > 0 && (
            <Link
              href="/quizzes"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          )}
        </div>

        {!quizzes || quizzes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-medium">No quizzes yet</p>
                <p className="text-sm text-muted-foreground">
                  Upload a lecture PDF to create your first quiz
                </p>
              </div>
              <Button asChild>
                <Link href="/upload">Upload your first PDF</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
