"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const FORM_ENDPOINT = "https://formspree.io/f/xykgaqnk";

export default function FeedbackForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        form.reset();
        toast.success("Thanks for the feedback.");
        setSubmitted(true);
      } else {
        const data = await response.json().catch(() => null);
        const message =
          data?.errors?.[0]?.message ??
          "Unable to send feedback. Please try again.";
        toast.error(message);
      }
    } catch {
      toast.error("Unable to send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted">
          <CheckCircle2 className="h-6 w-6 text-foreground" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground">
            Thanks for the feedback.
          </p>
          <p className="text-sm text-muted-foreground">
            We read every note and use it to improve Density.
          </p>
        </div>
        <Button asChild className="h-10 rounded-full px-6 text-sm font-semibold">
          <Link href="/">Return to home</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      action={FORM_ENDPOINT}
      method="POST"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="feedback-name">Name (optional)</Label>
          <Input
            id="feedback-name"
            name="name"
            placeholder="Your name"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedback-email">Email (optional)</Label>
          <Input
            id="feedback-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            className="h-11"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="feedback-message">Message</Label>
        <Textarea
          id="feedback-message"
          name="message"
          placeholder="Share feedback, ideas, or bugs..."
          rows={5}
          required
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="h-11 w-full rounded-full text-sm sm:text-base font-semibold tracking-wide"
      >
        {submitting ? "Sending..." : "Send feedback"}
      </Button>
    </form>
  );
}
