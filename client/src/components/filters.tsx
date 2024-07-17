import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AutocompleteInput } from "./autocomplete-input";
import { useOutsideClick } from "@/hooks/use-outside-click";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Filters = ({
  data,
  setData,
  xlsData,
  legend,
  setLegend,
  selectedFilters: initialSelectedFilters,
  setSelectedFilters: setInitialSelectedFilters,
  removeUnknown,
}: FiltersProps) => {
  const [filterLabels, setFilterLabels] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useOutsideClick(() => setIsDropdownOpen(false));
  const [selectedFilters, setSelectedFilters] = useState<selectedFiltersType>(
    initialSelectedFilters,
  );
  useEffect(() => {
    setInitialSelectedFilters(selectedFilters);
  }, [selectedFilters, setInitialSelectedFilters]);
  const SpacedNamed = (param: string) => {
    switch (param) {
      case "PoliceStation":
        return "Police Station";
      case "AreaCommittee":
        return "Area Committee";
      case "IntUniqueNo":
        return "Int Unique No";
      case "IntContent":
        return "Int Content";
      case "Name_":
        return "Short name"; // Change the display name to "Alias"
      default:
        return param;
    }
  };

  useEffect(() => {
    if (xlsData.length > 0) {
      setFilterLabels(Object.keys(xlsData[0]));
    }
  }, [xlsData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { startDate, endDate, ...otherFilters } = selectedFilters;

    // Filter by date range first

    const filteredByDate = xlsData.filter((data) => {
      if (data.Date && typeof data.Date === "string") {
        const dataDate = new Date(
          String(data.Date).split("/").reverse().join("-"),
        );

        if (startDate && endDate) {
          return (
            dataDate >= new Date(startDate) && dataDate <= new Date(endDate)
          );
        } else if (startDate) {
          return dataDate >= new Date(startDate);
        } else if (endDate) {
          return dataDate <= new Date(endDate);
        }
      }

      return true; // No date filter applied
    });

    // Filter by other conditions
    const finalData = filteredByDate.filter((data) => {
      return Object.entries(otherFilters).every(([key, value]) => {
        if (value === undefined || value === "") {
          return true;
        }

        const dataValue = data[key as keyof xlsDataType]
          ?.toString()
          .toLowerCase();
        const filterValue =
          typeof value !== "undefined" && value !== null
            ? value.toString().toLowerCase()
            : "";
        return dataValue === filterValue;
      });
    });

    setData(finalData);
  };
  useEffect(() => {
    if (data.length === 0) {
      toast.info("No data found!");
    }
  }, [data]);

  const handleLabels = (label: string, checked: boolean) => {
    setSelectedFilters((prevFilters) => {
      if (checked) {
        // Add the new filter
        return {
          ...prevFilters,
          [label]: "", // Initialize with an empty string for all types
        };
      } else {
        // Remove the filter
        const { [label]: omitted, ...rest } = prevFilters;
        return rest;
      }
    });
  };

  const checkFilterIncludes = (label: string) => {
    const keys = Object.keys(selectedFilters);
    if (keys.includes(label)) {
      return true;
    }
    return false;
  };

  const handleChange = (value: string, selected: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [selected]: value,
    }));
  };

  const getSuggestions = (selected: string) => {
    const uniqueValues = Array.from(
      new Set(xlsData.map((item) => item[selected as keyof typeof item]))
    );
    return uniqueValues
      .filter((value) => value != null && (!removeUnknown || (value !== "Unknown" && value !== "ukn")))
      .map(String);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="h-[200px] w-full shadow-xl p-4 shadow-slate-300 flex gap-x-2"
    >
      <div className="w-fit flex flex-col gap-y-2">
        <h2 className="text-lg">Filters</h2>
        <DropdownMenu open={isDropdownOpen}>
          <DropdownMenuTrigger
            className="w-fit"
            asChild
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Button variant="dropDown">Choose Filters</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="flex flex-col gap-y-1 overflow-auto"
            ref={dropdownRef}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsDropdownOpen(false);
              }
            }}
          >
            {filterLabels.length !== 0 ? (
              filterLabels.map((label) => (
                <DropdownMenuCheckboxItem
                  key={label}
                  checked={checkFilterIncludes(label)}
                  onCheckedChange={(checked) => handleLabels(label, checked)}
                  className={cn(
                    checkFilterIncludes(label) &&
                      "bg-blue-600 text-white focus:bg-blue-600 focus:text-white focus:bg-opacity-90",
                  )}
                >
                  {SpacedNamed(label)}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <DropdownMenuCheckboxItem>
                No filters yet
              </DropdownMenuCheckboxItem>
            )}
            <DropdownMenuCheckboxItem
              key="startDate"
              checked={checkFilterIncludes("startDate")}
              onCheckedChange={(checked) => handleLabels("startDate", checked)}
              className={cn(
                checkFilterIncludes("startDate") &&
                  "bg-blue-600 text-white focus:bg-blue-600 focus:text-white focus:bg-opacity-90",
              )}
            >
              Start Date
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              key="endDate"
              checked={checkFilterIncludes("endDate")}
              onCheckedChange={(checked) => handleLabels("endDate", checked)}
              className={cn(
                checkFilterIncludes("endDate") &&
                  "bg-blue-600 text-white focus:bg-blue-600 focus:text-white focus:bg-opacity-90",
              )}
            >
              End Date
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button type="submit" variant="primary" className="w-full">
          Apply Filters
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-fit" asChild>
            <Button variant="dropDown" className="bg-orange-500 text-white">
              Choose legend
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex flex-col gap-y-1">
            {filterLabels.length !== 0 ? (
              filterLabels.map((label) => (
                <DropdownMenuItem
                  key={label}
                  onClick={() => setLegend(label)}
                  className={cn(
                    legend === label &&
                      "bg-blue-600 text-white focus:bg-blue-600 focus:text-white focus:bg-opacity-90",
                  )}
                >
                  {SpacedNamed(label)}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem>No filters yet</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-full flex flex-col flex-wrap p-2 gap-2">
        {selectedFilters ? (
          Object.keys(selectedFilters).map((selected) => (
            <div key={selected} className="flex flex-col gap-y-2">
              <AutocompleteInput
                id={selected}
                label={SpacedNamed(selected)}
                value={selectedFilters[selected]?.toString() || ""}
                onChange={(value) => handleChange(value, selected)}
                suggestions={getSuggestions(selected)}
                colorize={selected === "Name_"}
              />
            </div>
          ))
        ) : (
          <p>No Filters Selected</p>
        )}
      </div>
    </form>
  );
};