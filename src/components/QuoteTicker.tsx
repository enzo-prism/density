"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const quotes = [
  {
    text: "Hard work doesn't guarantee success, but improves its chances.",
    author: "B. J. Gupta",
  },
  {
    text: "Successful people are not gifted; they just work hard, then succeed on purpose.",
    author: "G. K. Nielson",
  },
  { text: "Effort is only effort when it begins to hurt.", author: "José Ortega y Gasset" },
  { text: "Work hard at work worth doing.", author: "Theodore Roosevelt" },
  {
    text: "Effort only fully releases its reward after a person refuses to quit.",
    author: "Napoleon Hill",
  },
  { text: "The one thing that matters is the effort.", author: "Antoine de Saint-Exupéry" },
  {
    text: "Hard work spotlights the character of people: some turn up their sleeves, some turn up their noses, and some don't turn up at all.",
    author: "Sam Ewing",
  },
  {
    text: "Work hard and be kind and amazing things will happen.",
    author: "Conan O’Brien",
  },
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert J. Collier",
  },
  {
    text: "The highest reward for man's toil is not what he gets for it, but what he becomes by it.",
    author: "John Ruskin",
  },
  {
    text: "The only limit to the height of your achievements is the reach of your dreams and your willingness to work hard for them.",
    author: "Michelle Obama",
  },
  {
    text: "Enthusiasm is the mother of effort, and without it nothing great was ever achieved.",
    author: "Ralph Waldo Emerson",
  },
  {
    text: "Success isn't always about greatness. It's about consistency. Consistent hard work leads to success. Greatness will come.",
    author: "Dwayne Johnson",
  },
  { text: "Hard work and togetherness. They go hand in hand.", author: "Tony Dungy" },
  { text: "Success is dependent on effort.", author: "Sophocles" },
  { text: "If you can't excel with talent, triumph with effort.", author: "Stephen G. Weinbaum" },
  {
    text: "Hard work is painful when life is devoid of purpose.",
    author: "Steve Pavlina",
  },
  { text: "Energy & persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "If you really want to do something, you will work hard for it.", author: "Edmund Hillary" },
  {
    text: "Satisfaction lies in the effort, not in the attainment; full effort is full victory.",
    author: "Mahatma Gandhi",
  },
  { text: "Practice is the best of all instructors.", author: "Publilius Syrus" },
  {
    text: "Failure happens all the time. It happens every day in practice. What makes you better is how you react to it.",
    author: "Mia Hamm",
  },
  {
    text: "Great things come from hard work and perseverance. No excuses.",
    author: "Kobe Bryant",
  },
  { text: "Talent without working hard is nothing.", author: "Cristiano Ronaldo" },
  {
    text: "Everyone's dream can come true if you just stick to it and work hard.",
    author: "Serena Williams",
  },
  {
    text: "Everything requires discipline, hard work and dedication, and, most importantly, self-belief.",
    author: "Serena Williams",
  },
  {
    text: "I've failed over and over and over again in my life. And that is why I succeed.",
    author: "Michael Jordan",
  },
  {
    text: "I can accept failure. Everyone fails at something. But I can't accept not trying.",
    author: "Michael Jordan",
  },
  {
    text: "There are no secrets to success. It is the result of preparation, hard work and learning from failure.",
    author: "Colin Powell",
  },
  { text: "Inspiration is the windfall from hard work and focus.", author: "Helen Hanson" },
  { text: "Life grants nothing to us mortals without hard work.", author: "Horace" },
  {
    text: "Striving for success without hard work is like trying to harvest where you haven't planted.",
    author: "David Bly",
  },
  {
    text: "Don’t be afraid of hard work. Nothing worthwhile comes easily.",
    author: "Gertrude B. Elion",
  },
  {
    text: "You just have to keep trying to do good work, and hope that it leads to more good work.",
    author: "Jon Stewart",
  },
  { text: "I'm no genius, and others can outwork me.", author: "Herman E. Daly" },
  {
    text: "It’s up to a young player to prove himself, work hard and wait for his chance.",
    author: "Darko Miličić",
  },
  { text: "There are no shortcuts to success on the field or in life.", author: "Tom Brady" },
  {
    text: "There are no shortcuts. There are no magic potions. There are no work-arounds.",
    author: "Jim Collins",
  },
  { text: "The more experience you have, the better you are.", author: "Chuck Yeager" },
  { text: "I have always believed that the WORK is the word.", author: "Robert Rauschenberg" },
  { text: "I attempt a difficult work; but there is no excellence without difficulty.", author: "Ovid" },
  { text: "The actual writing of a novel is extremely hard work.", author: "Alec Waugh" },
  { text: "Hard work never killed anybody, but why take a chance?", author: "Edgar Bergen (via Charlie McCarthy)" },
  {
    text: "I owe my success to simple perseverance, hard work and never taking anything for granted.",
    author: "Connie Ferguson",
  },
  {
    text: "Jesus was a great worker, and His disciples must not be afraid of hard work.",
    author: "Charles Spurgeon",
  },
  { text: "There are no shortcuts to any place worth going.", author: "Beverly Sills" },
  { text: "Work Hard, Have Fun, Make History", author: "Jeff Bezos" },
  {
    text: "There must be shame at the thought of shirking the hard work of the world.",
    author: "Theodore Roosevelt",
  },
  {
    text: "Desire’s a contract you make to be unhappy until you get what you want.",
    author: "Naval Ravikant",
  },
  {
    text: "Escape competition through authenticity.",
    author: "Naval Ravikant",
  },
  {
    text: "Strategy is easy. Execution is hard.",
    author: "Alex Hormozi",
  },
  {
    text: "If you can do it when it’s hard, you can keep doing it under any conditions.",
    author: "Alex Hormozi",
  },
  {
    text: "Stay hard!",
    author: "David Goggins",
  },
  {
    text: "You are in danger of living a life so comfortable and soft, that you will die without ever realizing your true potential.",
    author: "David Goggins",
  },
  {
    text: "A lot of people say they want to be great, but they’re not willing to make the sacrifices necessary to achieve greatness.",
    author: "Kobe Bryant",
  },
  {
    text: "Everything negative – pressure, challenges – is all an opportunity for me to rise.",
    author: "Kobe Bryant",
  },
  {
    text: "My favorite ring is the next one.",
    author: "Tom Brady",
  },
  {
    text: "I didn’t come this far to only come this far.",
    author: "Tom Brady",
  },
  {
    text: "As iron sharpens iron, so one person sharpens another.",
    author: "Ancient Proverb (Proverbs)",
  },
  {
    text: "Pride goes before destruction, a haughty spirit before a fall.",
    author: "Ancient Proverb (Proverbs)",
  },
  {
    text: "A gentle answer turns away wrath, but a harsh word stirs up anger.",
    author: "Ancient Proverb (Proverbs)",
  },
  {
    text: "Above all else, guard your heart, for everything you do flows from it.",
    author: "Ancient Proverb (Proverbs)",
  },
  {
    text: "Walk with the wise and become wise, for a companion of fools suffers harm.",
    author: "Ancient Proverb (Proverbs)",
  },
  {
    text: "What stands in the way becomes the way.",
    author: "Marcus Aurelius",
  },
  {
    text: "We are more often frightened than hurt; and we suffer more from imagination than from reality.",
    author: "Seneca",
  },
  {
    text: "Men are disturbed not by things, but by the views which they take of things.",
    author: "Epictetus",
  },
  {
    text: "The life which is unexamined is not worth living.",
    author: "Socrates (Plato, Apology)",
  },
  {
    text: "A journey of a thousand miles starts under one’s feet.",
    author: "Lao Tzu (Tao Te Ching, ch. 64)",
  },
];

const ROTATION_MS = 7000;
const FADE_MS = 650;
const DISPLAY_MS = ROTATION_MS - FADE_MS;

function shuffleQuotes(list: typeof quotes) {
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

type QuoteTickerProps = {
  className?: string;
};

export default function QuoteTicker({ className }: QuoteTickerProps) {
  const [orderedQuotes, setOrderedQuotes] = useState(quotes);
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const fadeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setOrderedQuotes(shuffleQuotes(quotes));
      setIndex(0);
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIsVisible(false);
      fadeTimeoutRef.current = window.setTimeout(() => {
        setIndex((current) => (current + 1) % orderedQuotes.length);
        setIsVisible(true);
      }, FADE_MS);
    }, ROTATION_MS);

    return () => {
      window.clearInterval(id);
      if (fadeTimeoutRef.current) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [orderedQuotes.length]);

  const quote = orderedQuotes[index] ?? orderedQuotes[0];

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-none border-x-0 border-t-0 bg-card/95 shadow-none",
        className
      )}
    >
      <CardContent className="flex min-h-[52px] flex-col gap-2 px-4 py-3 text-xs text-muted-foreground sm:min-h-[44px] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        <p
          className={cn(
            "max-w-full italic line-clamp-2 transition-[opacity,transform,filter] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:max-w-[70%] sm:line-clamp-1",
            "will-change-[opacity,transform,filter] motion-reduce:transform-none",
            isVisible
              ? "opacity-100 translate-y-0 blur-0"
              : "opacity-0 -translate-y-1 blur-[1px]"
          )}
          aria-live="polite"
        >
          “{quote.text}”
        </p>
        <span
          className={cn(
            "hidden text-[11px] font-semibold uppercase tracking-[0.2em] transition-[opacity,transform,filter] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:inline",
            "will-change-[opacity,transform,filter] motion-reduce:transform-none",
            isVisible
              ? "opacity-100 translate-y-0 blur-0"
              : "opacity-0 translate-y-1 blur-[1px]"
          )}
        >
          — {quote.author}
        </span>
      </CardContent>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px">
        <div
          key={`progress-${index}`}
          className="h-full origin-left bg-foreground/30 quote-progress"
          style={{ ["--quote-duration" as string]: `${DISPLAY_MS}ms` }}
        />
      </div>
    </Card>
  );
}
