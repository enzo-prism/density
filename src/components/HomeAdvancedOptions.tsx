"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const suggestedTimezones = [
  "UTC",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

type RangePreset = { label: string; value: number };

type HomeAdvancedOptionsProps = {
  timezone: string;
  onTimezoneChange: (value: string) => void;
  rangeSelection: string;
  onRangeChange: (value: string) => void;
  rangePresets: RangePreset[];
  customDaysInput: string;
  onCustomDaysChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCustomDaysBlur: () => void;
};

export default function HomeAdvancedOptions({
  timezone,
  onTimezoneChange,
  rangeSelection,
  onRangeChange,
  rangePresets,
  customDaysInput,
  onCustomDaysChange,
  onCustomDaysBlur,
}: HomeAdvancedOptionsProps) {
  const [timezoneOpen, setTimezoneOpen] = useState(false);

  const timezones = useMemo(() => {
    if (typeof Intl === "undefined") {
      return suggestedTimezones;
    }
    const supportedValuesOf = (Intl as typeof Intl & {
      supportedValuesOf?: (type: "timeZone") => string[];
    }).supportedValuesOf;
    if (!supportedValuesOf) {
      return suggestedTimezones;
    }
    try {
      const values = supportedValuesOf("timeZone");
      if (Array.isArray(values) && values.length > 0) {
        return values;
      }
    } catch {
      // Ignore failures and keep fallback list.
    }
    return suggestedTimezones;
  }, []);

  const timezoneOptions = useMemo(() => {
    if (!timezone) {
      return timezones;
    }
    return timezones.includes(timezone) ? timezones : [timezone, ...timezones];
  }, [timezones, timezone]);

  const suggestedOptions = useMemo(() => {
    return Array.from(new Set([timezone, ...suggestedTimezones])).filter((zone) =>
      timezoneOptions.includes(zone)
    );
  }, [timezoneOptions, timezone]);

  const remainingOptions = useMemo(() => {
    return timezoneOptions.filter((zone) => !suggestedOptions.includes(zone));
  }, [timezoneOptions, suggestedOptions]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="timezone">Timezone</Label>
          <Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
            <PopoverTrigger asChild>
              <Button
                id="timezone"
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={timezoneOpen}
                className="h-11 w-full justify-between font-normal"
              >
                <span className="line-clamp-1 text-left">
                  {timezone || "Select timezone"}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search timezone..." />
                <CommandList>
                  <CommandEmpty>No timezone found.</CommandEmpty>
                  <CommandGroup heading="Suggested">
                    {suggestedOptions.map((zone) => (
                      <CommandItem
                        key={`tz-suggested-${zone}`}
                        value={zone}
                        onSelect={() => {
                          onTimezoneChange(zone);
                          setTimezoneOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            timezone === zone ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {zone}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {remainingOptions.length > 0 ? <CommandSeparator /> : null}
                  {remainingOptions.length > 0 ? (
                    <CommandGroup heading="All timezones">
                      {remainingOptions.map((zone) => (
                        <CommandItem
                          key={`tz-${zone}`}
                          value={zone}
                          onSelect={() => {
                            onTimezoneChange(zone);
                            setTimezoneOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              timezone === zone ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {zone}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : null}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-3">
          <Label htmlFor="range">Date range</Label>
          <Select value={rangeSelection} onValueChange={onRangeChange}>
            <SelectTrigger id="range" className="h-11">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {rangePresets.map((preset) => (
                <SelectItem key={`range-${preset.value}`} value={String(preset.value)}>
                  {preset.label}
                </SelectItem>
              ))}
              <SelectItem value="lifetime">Lifetime</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          {rangeSelection === "custom" ? (
            <div className="space-y-2">
              <Label htmlFor="custom-days" className="text-xs">
                Custom days (30–3650)
              </Label>
              <Input
                id="custom-days"
                type="number"
                inputMode="numeric"
                min={30}
                max={3650}
                value={customDaysInput}
                onChange={onCustomDaysChange}
                onBlur={onCustomDaysBlur}
                className="h-11"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
