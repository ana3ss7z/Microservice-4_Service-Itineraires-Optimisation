/**
 * Export utilities for route data
 */

/**
 * Export data to JSON file
 */
export const exportToJSON = (data, filename = "export") => {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  downloadBlob(blob, `${filename}.json`);
};

/**
 * Export data to CSV file
 */
export const exportToCSV = (data, filename = "export") => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(","), // Header row
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle special characters and quotes
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          if (
            stringValue.includes(",") ||
            stringValue.includes('"') ||
            stringValue.includes("\n")
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8",
  });
  downloadBlob(blob, `${filename}.csv`);
};

/**
 * Export routes to a formatted report
 */
export const exportRoutesReport = (routes, format = "json") => {
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `routes-export-${timestamp}`;

  // Prepare data for export
  const exportData = routes.map((route) => ({
    routeId: route.routeId || route.id,
    userId: route.userId,
    username: route.username,
    originCity: route.originCity || route.adresseDepart,
    destinationCity: route.destinationCity || route.adresseDestination,
    distanceKm: route.totalDistanceKm || route.distanceKm,
    durationMin: route.totalDurationMin || route.durationMin,
    volume: route.volume,
    natureMarchandise: route.natureMarchandise,
    status: route.status,
    isOptimized: route.isOptimized,
    includeReturn: route.includeReturn,
    createdAt: route.createdAt || route.calculatedAt,
  }));

  if (format === "csv") {
    exportToCSV(exportData, filename);
  } else {
    exportToJSON(exportData, filename);
  }
};

/**
 * Helper function to download blob
 */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format bytes to human readable
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};
