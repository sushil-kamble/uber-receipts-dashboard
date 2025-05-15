"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRangePickerProps } from "../types";

export default function DateRangePicker({
  dateRange,
  setDateRange,
}: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange>(dateRange);

  // Sync internal state with parent state
  useEffect(() => {
    setDate(dateRange);
  }, [dateRange]);

  // Predefined date ranges
  const last7Days = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    setDateRange({ from, to });
  };

  const last30Days = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    setDateRange({ from, to });
  };

  const last90Days = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 90);
    setDateRange({ from, to });
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full md:w-auto justify-start text-left font-normal",
                !date.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date.from}
              selected={date}
              onSelect={(selectedDate) => {
                // Always update the internal state
                setDate(selectedDate || { from: undefined, to: undefined });
                // Only update parent state when we have a complete range
                if (selectedDate?.from) {
                  setDateRange(selectedDate);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={last7Days}
          className="text-xs"
        >
          Last 7 Days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={last30Days}
          className="text-xs"
        >
          Last 30 Days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={last90Days}
          className="text-xs"
        >
          Last 90 Days
        </Button>
      </div>
    </div>
  );
}
