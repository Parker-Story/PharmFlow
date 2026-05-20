import { UploadForm } from "@/components/upload/upload-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Upload PDF — PharmFlow" };

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Upload Lecture</h1>
        <p className="text-muted-foreground">
          Your PDF is processed server-side and never stored — only the generated quiz is saved.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Quiz</CardTitle>
          <CardDescription>
            Upload a lecture PDF to instantly generate practice questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
