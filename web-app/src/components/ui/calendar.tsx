import React from "react";
import CalendarBase from "react-calendar";
import "react-calendar/dist/Calendar.css";

export type CalendarProps = {
  className?: string;
  value: Date;
  onChange: (date: Date) => void;
};

const Calendar: React.FC<CalendarProps> = ({ className, value, onChange }) => {
  return (
    <CalendarBase
      className={className}
      value={value}
      onChange={(date) => {
        // react-calendar can return Date or Date[]
        if (Array.isArray(date)) {
          onChange(date[0]);
        } else {
          onChange(date);
        }
      }}
      // Show navigation, year/month pickers, today button
      showNavigation={true}
      showNeighboringMonth={true}
      prevLabel={<span>&lt;</span>}
      nextLabel={<span>&gt;</span>}
      prev2Label={<span>&laquo;</span>}
      next2Label={<span>&raquo;</span>}
      // CalendarBase has built-in today button in navigation
      // You can style it via CSS if needed
    />
  );
};

export { Calendar };
