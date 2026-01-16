import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface YearFilterProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  availableYears?: number[];
}

const YearFilter = ({ selectedYear, onYearChange, availableYears }: YearFilterProps) => {
  // Generate years from 2020 to current year + 1
  const currentYear = new Date().getFullYear();
  const defaultYears = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => currentYear + 1 - i);
  const years = availableYears && availableYears.length > 0 ? availableYears : defaultYears;

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default YearFilter;
