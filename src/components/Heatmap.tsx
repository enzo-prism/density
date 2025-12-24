import { dateToDayIndex, listDatesInRange } from "@/lib/dates";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekdayIndex(date: string): number {
  const utcDay = new Date(`${date}T00:00:00Z`).getUTCDay();
  return (utcDay + 6) % 7;
}

function getIntensityClass(count: number) {
  if (count >= 4) {
    return "bg-sky-700";
  }
  if (count >= 2) {
    return "bg-sky-500";
  }
  if (count === 1) {
    return "bg-sky-300";
  }
  return "bg-slate-200/70";
}

type HeatmapProps = {
  startDate: string;
  endDate: string;
  days: Record<string, number>;
};

export default function Heatmap({ startDate, endDate, days }: HeatmapProps) {
  const dates = listDatesInRange(startDate, endDate);
  const leadingEmpty = getWeekdayIndex(startDate);
  const totalCells = leadingEmpty + dates.length;
  const trailingEmpty = (7 - (totalCells % 7)) % 7;
  const cells = [
    ...Array.from({ length: leadingEmpty }).map(() => null),
    ...dates,
    ...Array.from({ length: trailingEmpty }).map(() => null),
  ];

  const startIndex = dateToDayIndex(startDate);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Posting heatmap
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-4">
          <div className="grid grid-rows-7 gap-2 text-[11px] text-slate-400">
            {dayLabels.map((label, index) => (
              <div key={label} className={index % 2 === 0 ? "" : "opacity-0"}>
                {label}
              </div>
            ))}
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="grid w-max grid-flow-col grid-rows-7 gap-2">
              {cells.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${startIndex}-${index}`}
                      className="h-3.5 w-3.5 rounded-[4px] bg-transparent"
                    />
                  );
                }
                const count = days[date] ?? 0;
                const label = `${date} • ${count} post${count === 1 ? "" : "s"}`;
                return (
                  <div
                    key={date}
                    title={label}
                    className={`h-3.5 w-3.5 rounded-[4px] ${getIntensityClass(
                      count
                    )} transition-colors`}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Less</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 4].map((count) => (
              <span
                key={`legend-${count}`}
                className={`h-3 w-3 rounded-[4px] ${getIntensityClass(count)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
