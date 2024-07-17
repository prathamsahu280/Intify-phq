import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import { stringToColor } from "@/lib/utils";
import { convertGRToDecimal } from "@/utils/conversion";
import { handleFile } from "@/utils/file-reader";

export const XLS = ({
  showLayer,
  data,
  setData,
  legend,
  setkmlData,
  setXlsData,
  map,
  removeUnknown,
  setRemoveUnknown,
  spreadsheetId,
  sheetName,
  columnMapping,
  usedFilters
}: XLSProps) => {
  const [filteredData, setFilteredData] = useState<xlsDataType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/spreadsheet?id=${spreadsheetId}&name=${sheetName}`,
        );
        const rows = res.data;
        const headers = rows.shift(); // Remove and store header row

        const processedData = rows.map((row: any) => {
          const processedRow: any = {};

          // Handle column mapping
          Object.entries(columnMapping || {}).forEach(([key, value]) => {
            const index = headers.indexOf(value);
            if (index !== -1) {
              processedRow[key] = row[index];
            }
          });

          // Handle selected fields
          Object.entries(usedFilters).forEach(([key, type]) => {
            const index = headers.indexOf(key);
            if (index !== -1) {
              if (type === 'Numbers') {
                processedRow[key] = parseInt(row[index], 10) || 0; // Use 0 if parsing fails
              } else {
                processedRow[key] = row[index];
              }
            }
          });

          return processedRow;
        });

        setFilteredData(processedData);
        setData(processedData);
        setXlsData(processedData);
      } catch (error) {
        console.error("Error fetching spreadsheet data:", error);
      }
    };
    if (showLayer.marker && spreadsheetId && sheetName) {
      fetchData();
    }
  }, [showLayer.marker, spreadsheetId, sheetName, columnMapping, usedFilters]);

  useEffect(() => {
    const updateFilteredData = () => {
      const updatedFilteredData = removeUnknown
        ? data.filter(
            (el) =>
              !Object.values(el).some(
                (value) => value?.toString().toLowerCase() === "unknown",
              ),
          )
        : data;
      setFilteredData(updatedFilteredData);
    };

    updateFilteredData();
  }, [data, removeUnknown]);

  useEffect(() => {
    // Array to store marker instances
    const markers: mapboxgl.Marker[] = [];

    // Function of creating markers with specific colors generated
    const createMarkers = () => {
      setkmlData((_) => []);
      // Create an empty mapboxgl bounds object
      const bounds = new mapboxgl.LngLatBounds();

      // Loop through each coordinate in the array
      filteredData.forEach((el) => {
        // Create a marker for each coordinate
        if (el.GR && el.GR.length > 0) {
          const coordinates = convertGRToDecimal(el.GR) as [number, number];
          // Extend the bounds to include each coordinate
          if (!isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
            const markerElement = document.createElement("div");
            markerElement.className = "marker";

            // Create marker icon
            const markerIcon = document.createElement("div");
            markerIcon.className = "marker-icon";
            markerElement.appendChild(markerIcon);
            markerIcon.style.backgroundRepeat = "no-repeat";

            // Create marker info
            const markerInfo = document.createElement("div");

            markerInfo.className = "marker-info";
            markerInfo.innerHTML = `<h3>${el[legend as keyof xlsDataType] || ''}</h3>`;

            // Generating specific colors according to Name_ field
            markerInfo.style.backgroundColor = stringToColor(el.Name_ || '');

            markerElement.appendChild(markerInfo);

            // Creating popup
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<h3>${el["IntUniqueNo" as keyof xlsDataType] || ''}: ${el["IntContent" as keyof xlsDataType] || ''} </h3>`,
            );

            const marker = new mapboxgl.Marker({
              element: markerElement,
            })
              .setLngLat(coordinates)
              .setPopup(popup)
              .addTo(map.current);

            markers.push(marker);

            // Extend the bounds to include each coordinate
            bounds.extend(coordinates);

            // Generating kml according to the filtered or initial data
            const newKmlData = {
              name: el[legend as keyof xlsDataType] || '',
              longitude: coordinates[0],
              latitude: coordinates[1],
            } as kmlDataType;
            setkmlData((prev: kmlDataType[]) => [...prev, newKmlData]);
          }
        }
      });

      // Fit the map to the bounds
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { padding: 50 });
      }
    };

    if (filteredData.length !== 0 && showLayer.marker && map.current) {
      createMarkers();
    }

    // Removing previous markers after new markers have been created
    return () => {
      markers.forEach((marker) => {
        marker.remove();
      });
    };
  }, [filteredData, legend, showLayer.marker, map]);

  return (
    <>
      <label
        htmlFor="xls-file"
        className="absolute hidden top-4 left-4 p-2 px-3 z-10 bg-blue-500 text-white rounded"
      >
        Import Excel
      </label>
      <input
        id="xls-file"
        type="file"
        onChange={(event) => handleFile(event, setData, setXlsData)}
        className="hidden"
      />
      <button
        onClick={() => setRemoveUnknown(!removeUnknown)}
        className="absolute top-16 right-4 p-2 px-3 z-10 bg-red-500 text-white rounded"
      >
        {removeUnknown ? "Include Unknown" : "Remove Unknown"}
      </button>
    </>
  );
};