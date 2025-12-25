"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const quotes = [
  { text: "Discipline equals freedom.", author: "Jocko Willink" },
  { text: "Good.", author: "Jocko Willink" },
  { text: "Extreme ownership.", author: "Jocko Willink" },
  { text: "No bad teams, only bad leaders.", author: "Jocko Willink" },
  { text: "Check your ego.", author: "Jocko Willink" },
  { text: "Get after it.", author: "Jocko Willink" },
  { text: "Prioritize and execute.", author: "Jocko Willink" },
  { text: "Cover and move.", author: "Jocko Willink" },
  { text: "Leadership is influence.", author: "Jocko Willink" },
  { text: "Detach.", author: "Jocko Willink" },
  {
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
  },
  {
    text: "Knowing others is intelligence; knowing yourself is true wisdom.",
    author: "Lao Tzu",
  },
  { text: "Where there is ruin, there is hope for a treasure.", author: "Rumi" },
  {
    text: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus",
  },
  {
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca",
  },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Wherever you go, go with all your heart.", author: "Confucius" },
  {
    text: "Act as if what you do makes a difference. It does.",
    author: "William James",
  },
  {
    text: "In the depth of winter, I finally learned that within me there lay an invincible summer.",
    author: "Albert Camus",
  },
  {
    text: "Success is nothing more than a few simple disciplines, practiced every day.",
    author: "Jim Rohn",
  },
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius",
  },
  {
    text: "I am not a product of my circumstances. I am a product of my decisions.",
    author: "Stephen R. Covey",
  },
  {
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
  },
  {
    text: "Suffering ceases to be suffering at the moment it finds a meaning.",
    author: "Viktor E. Frankl",
  },
  { text: "If you fell down yesterday, stand up today.", author: "H. G. Wells" },
  {
    text: "Do not pray for an easy life, pray for the strength to endure a difficult one.",
    author: "Bruce Lee",
  },
  { text: "The struggle itself is enough to fill a man's heart.", author: "Albert Camus" },
  { text: "Through discipline comes freedom.", author: "Aristotle" },
  { text: "The harder the conflict, the greater the triumph.", author: "George Washington" },
  {
    text: "Nothing in the world is worth having or worth doing unless it means effort, pain, difficulty.",
    author: "Theodore Roosevelt",
  },
  {
    text: "We must embrace pain and burn it as fuel for our journey.",
    author: "Kenji Miyazawa",
  },
  { text: "Man cannot remake himself without suffering.", author: "Alexis Carrel" },
  { text: "I am long and hard on the path that leads to the heights.", author: "Vincent van Gogh" },
  {
    text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Zig Ziglar",
  },
  { text: "Smooth seas do not make skillful sailors.", author: "African proverb" },
  { text: "Fall seven times, stand up eight.", author: "Japanese proverb" },
  { text: "A gem cannot be polished without friction.", author: "Chinese proverb" },
  { text: "Patience is bitter, but its fruit is sweet.", author: "Aristotle" },
  { text: "Little by little, one travels far.", author: "J. R. R. Tolkien" },
  {
    text: "The fire tests gold; adversity tests men.",
    author: "Ancient Greek proverb",
  },
  {
    text: "He who would learn to fly one day must first learn to walk and run.",
    author: "Nietzsche",
  },
  { text: "Dig the well before you are thirsty.", author: "Chinese proverb" },
  { text: "Adversity makes men, prosperity makes monsters.", author: "Latin proverb" },
  { text: "Endure, and preserve yourself for better things.", author: "Virgil" },
  { text: "The axe forgets; the tree remembers.", author: "African proverb" },
  { text: "No man steps in the same river twice.", author: "Heraclitus" },
  {
    text: "Difficult roads often lead to beautiful destinations.",
    author: "Persian proverb",
  },
  {
    text: "Through hardship, to the stars. (Per aspera ad astra)",
    author: "Latin proverb",
  },
  { text: "The wound is the place where the Light enters you.", author: "Rumi" },
  {
    text: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'",
    author: "Muhammad Ali",
  },
  {
    text: "I've failed over and over and over again in my life. And that is why I succeed.",
    author: "Michael Jordan",
  },
  {
    text: "Everything negative - pressure, challenges - is all an opportunity for me to rise.",
    author: "Kobe Bryant",
  },
  {
    text: "Champions keep playing until they get it right.",
    author: "Billie Jean King",
  },
  {
    text: "Gold medals aren't really made of gold. They're made of sweat, determination, and a hard-to-find alloy called guts.",
    author: "Jesse Owens",
  },
  {
    text: "You can't put a limit on anything. The more you dream, the farther you get.",
    author: "Michael Phelps",
  },
  { text: "I've grown most not from victories, but setbacks.", author: "Serena Williams" },
  { text: "Dreams are free. Goals cost suffering.", author: "Usain Bolt" },
  { text: "Suffering is temporary. Quitting lasts forever.", author: "Lance Armstrong" },
  {
    text: "To give anything less than your best is to sacrifice the gift.",
    author: "Steve Prefontaine",
  },
  {
    text: "The secret of success is consistency of purpose.",
    author: "Eliud Kipchoge",
  },
  { text: "You don't get what you wish for. You get what you work for.", author: "Tom Brady" },
  { text: "Pain is temporary. Pride is forever.", author: "Evander Holyfield" },
  {
    text: "I knew that if I failed I wouldn't regret that, but I knew the one thing I might regret is not trying.",
    author: "Jeff Bezos",
  },
  {
    text: "It's fine to celebrate success, but it is more important to heed the lessons of failure.",
    author: "Bill Gates",
  },
  {
    text: "If you're not a little embarrassed by the first version of your product, you launched too late.",
    author: "Reid Hoffman",
  },
  {
    text: "Most overnight successes are ten years in the making.",
    author: "Jeff Bezos",
  },
  {
    text: "I didn't get there by wishing for it or hoping for it, but by working for it.",
    author: "Estee Lauder",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Design is not just what it looks like and feels like. Design is how it works.",
    author: "Steve Jobs",
  },
  {
    text: "Failure is an option here. If things are not failing, you are not innovating enough.",
    author: "Elon Musk",
  },
  { text: "The biggest risk is not taking any risk.", author: "Mark Zuckerberg" },
  {
    text: "When you find an idea that you just can't stop thinking about, that's probably a good one to pursue.",
    author: "Josh James",
  },
  {
    text: "Success is a lousy teacher. It seduces smart people into thinking they can't lose.",
    author: "Bill Gates",
  },
  {
    text: "You don't learn to walk by following rules. You learn by doing, and by falling over.",
    author: "Richard Branson",
  },
  {
    text: "Chase the vision, not the money; the money will end up following you.",
    author: "Tony Hsieh",
  },
  {
    text: "Patience, persistence, and perspiration make an unbeatable combination for success.",
    author: "Napoleon Hill",
  },
  { text: "Nothing works better than just improving your product.", author: "Joel Spolsky" },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "Whatever the mind can conceive and believe, it can achieve.",
    author: "Napoleon Hill",
  },
  {
    text: "Strength and growth come only through continuous effort and struggle.",
    author: "Napoleon Hill",
  },
  {
    text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    author: "Stephen R. Covey",
  },
  {
    text: "Most people do not listen with the intent to understand; they listen with the intent to reply.",
    author: "Stephen R. Covey",
  },
  { text: "Where focus goes, energy flows.", author: "Tony Robbins" },
  {
    text: "It is in your moments of decision that your destiny is shaped.",
    author: "Tony Robbins",
  },
  {
    text: "Setting goals is the first step in turning the invisible into the visible.",
    author: "Tony Robbins",
  },
  {
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear",
  },
  {
    text: "Every action you take is a vote for the type of person you wish to become.",
    author: "James Clear",
  },
  {
    text: "Habits are the compound interest of self-improvement.",
    author: "James Clear",
  },
  {
    text: "When we are no longer able to change a situation, we are challenged to change ourselves.",
    author: "Viktor Frankl",
  },
  {
    text: "Those who have a 'why' to live, can bear with almost any 'how.'",
    author: "Viktor Frankl",
  },
  {
    text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
    author: "Viktor Frankl",
  },
  {
    text: "Compare yourself to who you were yesterday, not to who someone else is today.",
    author: "Jordan Peterson",
  },
  {
    text: "Pursue what is meaningful, not what is expedient.",
    author: "Jordan Peterson",
  },
  {
    text: "Set your house in perfect order before you criticize the world.",
    author: "Jordan Peterson",
  },
  {
    text: "Clarity about what matters provides clarity about what does not.",
    author: "Cal Newport",
  },
  {
    text: "Deep work is the ability to focus without distraction on a cognitively demanding task.",
    author: "Cal Newport",
  },
  {
    text: "If you don't produce, you won't thrive - no matter how skilled or talented you are.",
    author: "Cal Newport",
  },
  {
    text: "Realize deeply that the present moment is all you ever have.",
    author: "Eckhart Tolle",
  },
  {
    text: "Whatever the present moment contains, accept it as if you had chosen it.",
    author: "Eckhart Tolle",
  },
  {
    text: "You are in danger of living a life so comfortable and soft that you will die without ever realizing your true potential.",
    author: "David Goggins",
  },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
  {
    text: "Your excuses are lies you tell yourself to avoid discomfort.",
    author: "Alex Hormozi",
  },
  { text: "Play long-term games with long-term people.", author: "Naval" },
  { text: "Escape competition through authenticity.", author: "Naval" },
  {
    text: "Become the best in the world at what you do. Keep redefining what you do until this is true.",
    author: "Naval",
  },
  {
    text: "Pick an industry where you can play long term games with long term people.",
    author: "Naval",
  },
  {
    text: "Play iterated games. All the returns in life, whether in wealth, relationships, or knowledge, come from compound interest.",
    author: "Naval",
  },
  {
    text: "Pick business partners with high intelligence, energy, and, above all, integrity.",
    author: "Naval",
  },
  {
    text: "Arm yourself with specific knowledge, accountability, and leverage.",
    author: "Naval",
  },
  {
    text: "Code and media are permissionless leverage. They're the leverage behind the newly rich. You can create software and media that works for you while you sleep.",
    author: "Naval",
  },
  {
    text: "Give me a lever long enough, and a place to stand, and I will move the earth.",
    author: "Archimedes",
  },
  {
    text: "When something is important enough, you do it even if the odds are not in your favor.",
    author: "Elon",
  },
  {
    text: "Success is rented, not owned. And rent is due every day.",
    author: "Rory Vaden",
  },
  {
    text: "You'd be amazed how far a person can get when they simply refuse to fold under pressure.",
    author: "Alex Hormozi",
  },
  {
    text: "Questioning whether the goal is worth the suffering is just one of the many stops on the way to achieving it.",
    author: "Alex Hormozi",
  },
  {
    text: "Your life will get better the moment you stop waiting for it to get better and force yourself to get better.",
    author: "Alex Hormozi",
  },
  {
    text: "Losers change their goals because they're too lazy to change themselves.",
    author: "Alex Hormozi",
  },
  {
    text: "There are no perfect businesses. And waiting longer to start just delays how long it takes you to figure that out.",
    author: "Alex Hormozi",
  },
  { text: "If it was easy, everyone would do it.", author: "Alex Hormozi" },
  { text: "Your excuses don't matter. Your output does.", author: "Alex Hormozi" },
  { text: "Average is the enemy.", author: "Alex Hormozi" },
  { text: "Confidence comes from proof, not belief.", author: "Alex Hormozi" },
  { text: "Focus is about saying no.", author: "Steve Jobs" },
  { text: "Real artists ship.", author: "Steve Jobs" },
  { text: "Stay hungry. Stay foolish.", author: "Steve Jobs" },
  { text: "Great companies are built on great products.", author: "Elon Musk" },
  { text: "Work like hell.", author: "Elon Musk" },
  { text: "There is no shortcut.", author: "Jensen Huang" },
  { text: "You don't learn without pain.", author: "Jensen Huang" },
  { text: "Greatness is not intelligence. It's character.", author: "Jensen Huang" },
  { text: "Run toward problems.", author: "Jensen Huang" },
  { text: "It's always Day 1.", author: "Jeff Bezos" },
  { text: "Obsess over customers, not competitors.", author: "Jeff Bezos" },
  { text: "We are stubborn on vision, flexible on details.", author: "Jeff Bezos" },
  {
    text: "If you double the number of experiments, you double your inventiveness.",
    author: "Jeff Bezos",
  },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "And yet it moves.", author: "Galileo Galilei" },
  {
    text: "It is not the strongest who survive, but the most adaptable.",
    author: "Charles Darwin",
  },
  { text: "The present is theirs; the future is mine.", author: "Nikola Tesla" },
  { text: "I can accept failure. I can't accept not trying.", author: "Michael Jordan" },
  { text: "I hated every minute of training, but I said, don't quit.", author: "Muhammad Ali" },
  { text: "I trained four years to run nine seconds.", author: "Usain Bolt" },
  {
    text: "Everything negative - pressure, challenges - is an opportunity.",
    author: "Kobe Bryant",
  },
  { text: "To be successful, you have to be selfish.", author: "Tom Brady" },
  { text: "I don't like to lose - at anything.", author: "Serena Williams" },
  { text: "If you don't lose, you can't enjoy the victories.", author: "Rafael Nadal" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "You can't put a limit on anything.", author: "Michael Phelps" },
  { text: "You have to fight to reach your dream.", author: "Lionel Messi" },
  { text: "Aim to build something 10x better.", author: "Larry Page" },
  { text: "Solve important problems.", author: "Sergey Brin" },
  { text: "Competition is for losers.", author: "Peter Thiel" },
  { text: "Freedom and responsibility.", author: "Reed Hastings" },
  { text: "Software is eating the world.", author: "Marc Andreessen" },
  { text: "Compound progress.", author: "Sam Altman" },
  { text: "Make something people want.", author: "Paul Graham" },
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
        "relative overflow-hidden rounded-none border-x-0 border-t-0 bg-card/95 shadow-none dark:bg-background",
        className
      )}
    >
      <CardContent className="flex min-h-[80px] flex-col gap-2 px-4 py-3 text-xs text-muted-foreground sm:min-h-[52px] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
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
            "text-xs italic transition-[opacity,transform,filter] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none self-end sm:self-auto sm:ml-auto sm:text-right",
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
