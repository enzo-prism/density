import Link from "next/link";
import AppShell from "@/components/AppShell";
import FeedbackForm from "@/components/FeedbackForm";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function FeedbackPage() {
  return (
    <AppShell size="narrow">
      <PageHeader
        title="Feedback"
        subtitle="Share feedback, ideas, or bugs you've encountered."
      />

      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link href="/">Back to home</Link>
      </Button>

      <Card>
        <CardContent className="pt-6">
          <FeedbackForm />
        </CardContent>
      </Card>
    </AppShell>
  );
}
