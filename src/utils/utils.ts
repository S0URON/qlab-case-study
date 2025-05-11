import type { Anomaly } from "../apis/anomalies.api";
import type { Defect } from "../apis/defects.api";

/**
 * Formats a date string into 'DD/MM/YYYY' format.
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  // Note: getMonth() is 0-indexed, so 1 is added for correct month display.
  // This format might be ambiguous (e.g., 01/02/2023 could be Jan 2 or Feb 1).
  // Consider using a more standard format like YYYY-MM-DD if internationalization is a concern.
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

// export function searchDefects(data: Defect[], searchTerm: string): Defect[] {
//   const lowercasedSearchTerm = searchTerm.toLowerCase();

//   return data.filter((defect) => {
//     // Check each field in the Defect object
//     return Object.values(defect).some((value) => {
//       if (typeof value === "string") {
//         // If the value is a string, compare it with the search term
//         return value.toLowerCase().includes(lowercasedSearchTerm);
//       }
//       if (typeof value === "number") {
//         // If the value is a number, check if it contains the search term
//         return value.toString().includes(lowercasedSearchTerm);
//       }
//       if (value instanceof Date) {
//         // If the value is a Date, convert it to a string and compare
//         return value
//           .toLocaleDateString()
//           .toLowerCase()
//           .includes(lowercasedSearchTerm);
//       }
//       return false;
//     });
//   });
// }

/**
 * @typedef {Object} Algorithm
 * @property {string} name - The name of the anomaly detection algorithm.
 * @property {string[]} possibleFields - An array of field names that this algorithm can be applied to.
 * @property {string} information - A descriptive string about the algorithm.
 */
export type Algorithm = {
  name: string;
  possibleFields: string[];
  information: string;
};

/*
1. Z-Score Anomaly Detection for  Severity Rating:
This function detects anomalies in Severity Rating by calculating the Z-score for each value. Values with a Z-score greater than a threshold (e.g., 3) are flagged as anomalies.
*/

/**
 * Calculates the Z-score for each value in a numeric array.
 * Z-score indicates how many standard deviations an element is from the mean.
 * @param {number[]} values - An array of numbers.
 * @returns {number[]} An array of Z-scores corresponding to the input values.
 */
function calculateZScore(values: number[]): number[] {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
  );

  // If standard deviation is 0 (all values are the same), Z-scores will be NaN or Infinity.
  // Handle this by returning an array of 0s, as no value deviates from the mean.
  if (stdDev === 0) {
    return values.map(() => 0);
  }

  return values.map((value) => (value - mean) / stdDev);
}

/**
 * Detects anomalies in a list of defects based on the Z-score of a specified numeric field.
 * Currently hardcoded to operate only on the 'severityRating' field.
 * @param {Defect[]} defects - An array of defect objects.
 * @param {string} field - The numeric field in the defect objects to analyze (currently must be 'severityRating').
 * @param {number} [threshold=3] - The Z-score threshold. Defects with an absolute Z-score greater than this are considered anomalies.
 * @returns {Defect[]} An array of defect objects identified as anomalies. Returns an empty array if the field is not 'severityRating'.
 */
function detectAnomaliesByZScore(
  defects: Defect[],
  field: string,
  threshold: number = 3
): Defect[] {
  // This function is currently restricted to 'severityRating'.
  // Consider making it more generic if Z-score needs to be applied to other numeric fields.
  if (!["severityRating"].includes(field)) return [];
  const values: number[] = defects.map((defect) => defect[field] as number);
  const zScores = calculateZScore(values);
  console.log(zScores); // Logging Z-scores for debugging purposes.

  return defects.filter(
    (defect, index) => Math.abs(zScores[index]) > threshold
  );
}
/*
2. IQR (Interquartile Range) Anomaly Detection for Resolution Time:
This function detects anomalies in Resolution Time using the IQR method. Values outside the range (Q1 - 1.5 * IQR, Q3 + 1.5 * IQR) are flagged as anomalies.
*/

/**
 * Detects anomalies in a list of defects based on the Interquartile Range (IQR) of the 'resolutionTime' field.
 * Defects with 'resolutionTime' outside the typical range (Q1 - 1.5*IQR to Q3 + 1.5*IQR) are considered anomalies.
 * Currently hardcoded to operate only on the 'resolutionTime' field.
 * @param {Defect[]} defects - An array of defect objects.
 * @param {string} field - The numeric field to analyze (currently must be 'resolutionTime').
 * @returns {Defect[]} An array of defect objects identified as anomalies. Returns an empty array if the field is not 'resolutionTime'.
 */
function detectAnomaliesByIQR(defects: Defect[], field: string): Defect[] {
  // This function is currently restricted to 'resolutionTime'.
  // It could be generalized if IQR is needed for other numeric fields.
  if (!["resolutionTime"].includes(field)) return [];
  const values = defects.map((defect) => {
    return defect.resolutionTime;
  });

  // Sorting is crucial for calculating quartiles.
  const sortedValues = values.sort((a, b) => a - b);

  // Calculate Q1 (25th percentile) and Q3 (75th percentile).
  const Q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
  const Q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
  const IQR = Q3 - Q1;

  // Define the lower and upper bounds for outlier detection.
  const lowerBound = Q1 - 1.5 * IQR;
  const upperBound = Q3 + 1.5 * IQR;

  return defects.filter((defect) => {
    return (
      defect.resolutionTime < lowerBound || defect.resolutionTime > upperBound
    );
  });
}

/*
3. Frequency Count Anomaly Detection for Defect Category and Part of the Car:
This function detects anomalies by checking if a certain Defect Category or Part of the Car occurs too frequently or too infrequently compared to the rest of the dataset.
Note: The current implementation flags items that occur *more* frequently than a threshold.
To detect infrequent items, the comparison `count > threshold` would need to be adjusted (e.g., `count < lowerThreshold`).
*/

/**
 * Detects anomalies in a list of defects based on the frequency of values in a specified categorical field.
 * Items whose frequency is significantly higher than the average frequency (mean + stdDevMultiplier * stdDev) are flagged.
 * @param {Defect[]} defects - An array of defect objects.
 * @param {string} field - The categorical field in the defect objects to analyze (e.g., 'defectCategory', 'partOfTheCar').
 * @param {number} [stdDevMultiplier=2] - The number of standard deviations above the mean frequency to set the threshold.
 * @returns {Defect[]} An array of defect objects identified as anomalies (i.e., too frequent).
 */
function detectAnomaliesByFrequency(
  defects: Defect[],
  field: string,
  stdDevMultiplier: number = 2
): Defect[] {
  const frequencyMap: { [key: string]: number } = {};

  // Count the frequency of each unique value in the specified field.
  defects.forEach((defect) => {
    const value = defect[field]; // Assumes 'field' is a valid key in Defect
    frequencyMap[value] = (frequencyMap[value] || 0) + 1;
  });

  // Calculate the mean frequency of all unique values.
  const frequencies = Object.values(frequencyMap);
  if (frequencies.length === 0) return []; // No data to analyze

  const mean =
    frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;

  // Calculate the standard deviation of frequencies.
  const variance =
    frequencies.reduce((sum, freq) => sum + Math.pow(freq - mean, 2), 0) /
    frequencies.length;
  const stdDev = Math.sqrt(variance);

  // Define the anomaly threshold: items occurring more frequently than this are anomalous.
  const threshold = mean + stdDevMultiplier * stdDev;

  // Filter defects whose field value's frequency exceeds the threshold.
  const anomalies = defects.filter((defect) => {
    const count = frequencyMap[defect[field]];
    return count > threshold; // Anomaly if the frequency is above the threshold
  });

  return anomalies;
}

/*
4. run the selected algorithm
*/

/**
 * Automatically flags anomalies in a list of defects using a specified algorithm and parameters.
 * It then invokes a callback function with the identified anomalies.
 * @param {Defect[]} defects - An array of defect objects to analyze.
 * @param {Algorithm} algorithm - An object describing the algorithm to use (name, possibleFields, information).
 * @param {string} field - The specific field within the defect objects to apply the algorithm to.
 * @param {number} controlValue - A control parameter for the algorithm (e.g., Z-score threshold, frequency stdDev multiplier).
 * @param {(anomalies: Anomaly[]) => Promise<void>} callback - An asynchronous function to be called with the array of generated Anomaly objects.
 * @returns {Promise<void>} A promise that resolves after the callback has been processed.
 */
export async function autoFlagAnomalies(
  defects: Defect[],
  algorithm: Algorithm,
  field: string,
  controlValue: number, // This might need to be more flexible (e.g., object for frequency min/max)
  callback: (anomalies: Anomaly[]) => Promise<void>
) {
  const anomalies: Anomaly[] = [];
  let identifiedDefects: Defect[] = [];

  switch (algorithm.name) {
    case "detectAnomaliesByFrequency":
      // The 'field' parameter is used directly by detectAnomaliesByFrequency.
      // 'controlValue' here acts as the stdDevMultiplier.
      identifiedDefects = detectAnomaliesByFrequency(defects, field, controlValue);
      break;
    case "detectAnomaliesByZScore":
      // Note: detectAnomaliesByZScore is currently hardcoded to use 'severityRating'.
      // The 'field' parameter passed to autoFlagAnomalies might be intended for this,
      // but the internal function doesn't use it. 'controlValue' is the Z-score threshold.
      identifiedDefects = detectAnomaliesByZScore(defects, "severityRating", controlValue);
      break;
    case "detectAnomaliesByIQR":
      // Note: detectAnomaliesByIQR is currently hardcoded to use 'resolutionTime'.
      // The 'field' parameter might be intended for this. 'controlValue' is not used by this IQR implementation.
      identifiedDefects = detectAnomaliesByIQR(defects, "resolutionTime");
      break;
    default:
      console.warn(`Unknown algorithm: ${algorithm.name}`);
      // If an unknown algorithm is provided, call the callback with an empty array.
      await callback([]);
      return;
  }

  // Transform identified defect objects into Anomaly objects.
  identifiedDefects.forEach(
    (defect) => {
      const flaggingDate = new Date();
      anomalies.push({
        note: `${field} anomaly calculated by ${algorithm.name}`, // Uses the 'field' from autoFlagAnomalies parameters.
        status: "under review", // Default status for new anomalies.
        id: Math.floor(Math.random() * 10000) + "", // Generates a random string ID. Consider a more robust ID generation (e.g., UUID).
        defectId: defect.id,
        date: flaggingDate, // Stores the full Date object.
        time: `${flaggingDate.getHours()}:${flaggingDate.getMinutes()}:${flaggingDate.getSeconds()}`, // Formats time.
        flaggedBy: "system", // Indicates system-generated anomaly.
        suspectedField: field, // The field on which the anomaly was detected.
        suspectedValue: defect[field] + "", // The actual value of the suspected field.
      });
    }
  );

  // Invoke the callback with the list of created anomaly objects.
  await callback(anomalies);
}

/**
 * Calculates the frequency of each defect category and returns the top 5 most common ones.
 * @param {Defect[]} defects - An array of defect objects.
 * @returns {{ category: string; count: number }[]} An array of objects, each containing a defect category and its count, sorted by count in descending order (top 5).
 */
export function getTop5MostCommonDefects(
  defects: Defect[]
): { category: string; count: number }[] {
  const frequencyMap: { [key: string]: number } = {};

  // Count the frequency of each defect category.
  defects.forEach((defect) => {
    const category = defect.defectCategory;
    frequencyMap[category] = (frequencyMap[category] || 0) + 1;
  });

  // Convert the frequency map into an array of objects.
  const frequencyArray = Object.entries(frequencyMap).map(
    ([category, count]) => ({ category, count })
  );

  // Sort the array by count in descending order and take the first 5 elements.
  const sortedFrequency = frequencyArray
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return sortedFrequency;
}

/**
 * @typedef {Object} MotorTypeRate
 * @property {number} longRange - Percentage of defects for 'Long Range' motor type within a car model.
 * @property {number} highPerformance - Percentage of defects for 'High Performance' motor type.
 * @property {number} standard - Percentage of defects for 'Standard' motor type.
 */
/**
 * @typedef {Object} DesignPackageRate
 * @property {number} offroad - Percentage of defects for 'Offroad' design package.
 * @property {number} race - Percentage of defects for 'Race' design package.
 * @property {number} luxury - Percentage of defects for 'Luxury' design package.
 * @property {number} eco - Percentage of defects for 'Eco' design package.
 */
/**
 * @typedef {Object} CalculatedDefectRates
 * @property {string} carModel - The car model.
 * @property {number} total - Total number of defects for this car model.
 * @property {MotorTypeRate} motorTypeRate - Defect rates broken down by motor type for this model.
 * @property {DesignPackageRate} designPackageRate - Defect rates broken down by design package for this model.
 */
interface CalculatedDefectRates {
  carModel: string;
  total: number;
  motorTypeRate: {
    longRange: number;
    highPerformance: number;
    standard: number;
  };
  designPackageRate: {
    offroad: number;
    race: number;
    luxury: number;
    eco: number;
  };
}

/**
 * Calculates defect rates per car model, broken down by motor type and design package.
 * It iterates over a predefined list of car models.
 * @param {Defect[]} defects - An array of all defect objects.
 * @returns {CalculatedDefectRates[]} An array of objects, each detailing defect rates for a specific car model.
 *                                    Rates are percentages relative to the total defects for that specific model.
 */
export function calculateDefectRatesPerModel(
  defects: Defect[]
): CalculatedDefectRates[] {
  const calculatedData: CalculatedDefectRates[] = [];
  // Predefined list of car models to analyze.
  const carModelsToAnalyze = ["Base", "IX0M", "Long", "Alpina", "Pick-Up"];

  carModelsToAnalyze.forEach((model) => {
    // Filter defects specific to the current car model.
    const defectsForSpecificModel = defects.filter(
      (defect) => defect.carModel == model
    );

    // Count defects by motor type for the current model.
    const motorTypeCount = {
      longRangeCount: defectsForSpecificModel.filter(
        (d) => d.motorType == "Long Range"
      ).length,
      highPerformanceCount: defectsForSpecificModel.filter(
        (d) => d.motorType == "High Performance"
      ).length,
      standardCount: defectsForSpecificModel.filter(
        (d) => d.motorType == "Standard"
      ).length,
    };

    // Count defects by design package for the current model.
    const designPackageCount = {
      offroadCount: defectsForSpecificModel.filter(
        (d) => d.designPackage == "Offroad"
      ).length,
      raceCount: defectsForSpecificModel.filter(
        (d) => d.designPackage == "Race"
      ).length,
      luxuryCount: defectsForSpecificModel.filter(
        (d) => d.designPackage == "Luxury"
      ).length,
      ecoCount: defectsForSpecificModel.filter((d) => d.designPackage == "Eco")
        .length,
    };

    const totalDefectsForModel = defectsForSpecificModel.length;

    // Calculate rates as percentages. Handle division by zero if a model has no defects.
    calculatedData.push({
      carModel: model,
      total: totalDefectsForModel,
      motorTypeRate: {
        longRange: totalDefectsForModel > 0 ? (motorTypeCount.longRangeCount / totalDefectsForModel) * 100 : 0,
        highPerformance: totalDefectsForModel > 0 ? (motorTypeCount.highPerformanceCount / totalDefectsForModel) * 100 : 0,
        standard: totalDefectsForModel > 0 ? (motorTypeCount.standardCount / totalDefectsForModel) * 100 : 0,
      },
      designPackageRate: {
        offroad: totalDefectsForModel > 0 ? (designPackageCount.offroadCount / totalDefectsForModel) * 100 : 0,
        race: totalDefectsForModel > 0 ? (designPackageCount.raceCount / totalDefectsForModel) * 100 : 0,
        luxury: totalDefectsForModel > 0 ? (designPackageCount.luxuryCount / totalDefectsForModel) * 100 : 0,
        eco: totalDefectsForModel > 0 ? (designPackageCount.ecoCount / totalDefectsForModel) * 100 : 0,
      },
    });
  });

  return calculatedData;
}

/**
 * @typedef {Object} ModelDefect
 * @property {number} id - A unique identifier (index-based) for the data point.
 * @property {string} label - The name of the car model, motor type, or design package.
 * @property {number} value - The defect rate (percentage) for this label relative to all defects.
 */
interface ModelDefect {
  id: number;
  label: string;
  value: number;
}

/**
 * Calculates the defect rate for each predefined car model as a percentage of total defects.
 * @param {Defect[]} defects - An array of all defect objects.
 * @returns {ModelDefect[]} An array of objects, each representing a car model and its defect rate.
 */
export function modelDefectRate(defects: Defect[]): ModelDefect[] {
  const calculatedData: ModelDefect[] = [];
  const carModelsToAnalyze = ["Base", "IX0M", "Long", "Alpina", "Pick-Up"];
  const totalDefectsAllModels = defects.length;

  if (totalDefectsAllModels === 0) return []; // Avoid division by zero

  carModelsToAnalyze.forEach((model, index) => {
    const defectsForSpecificModel = defects.filter(
      (defect) => defect.carModel == model
    );
    calculatedData.push({
      id: index, // Using array index as ID.
      label: model,
      value: (defectsForSpecificModel.length / totalDefectsAllModels) * 100,
    });
  });
  return calculatedData;
}

/**
 * Calculates the defect rate for each predefined motor type as a percentage of total defects.
 * @param {Defect[]} defects - An array of all defect objects.
 * @returns {ModelDefect[]} An array of objects, each representing a motor type and its defect rate.
 */
export function motorTypeDefectRate(defects: Defect[]): ModelDefect[] {
  const calculatedData: ModelDefect[] = [];
  const motorTypesToAnalyze = ["High Performance", "Long Range", "Standard"];
  const totalDefectsAllTypes = defects.length;

  if (totalDefectsAllTypes === 0) return [];

  motorTypesToAnalyze.forEach((type, index) => {
    const defectsForSpecificType = defects.filter(
      (defect) => defect.motorType == type
    );
    calculatedData.push({
      id: index,
      label: type,
      value: (defectsForSpecificType.length / totalDefectsAllTypes) * 100,
    });
  });
  return calculatedData;
}

/**
 * Calculates the defect rate for each predefined design package as a percentage of total defects.
 * @param {Defect[]} defects - An array of all defect objects.
 * @returns {ModelDefect[]} An array of objects, each representing a design package and its defect rate.
 */
export function packageDefectRate(defects: Defect[]): ModelDefect[] {
  const calculatedData: ModelDefect[] = [];
  const packageTypesToAnalyze = ["Eco", "Luxury", "Offroad", "Race"];
  const totalDefectsAllPackages = defects.length;

  if (totalDefectsAllPackages === 0) return [];

  packageTypesToAnalyze.forEach((pkg, index) => {
    const defectsForSpecificPackage = defects.filter(
      (defect) => defect.designPackage == pkg
    );
    calculatedData.push({
      id: index,
      label: pkg,
      value: (defectsForSpecificPackage.length / totalDefectsAllPackages) * 100,
    });
  });
  return calculatedData;
}

/**
 * Filters defects for a specific station and extracts their ID and resolution time.
 * @param {Defect[]} defects - An array of all defect objects.
 * @param {string} station - The name of the station to filter defects for. Case-insensitive comparison.
 * @returns {{ station: string; defects: { id: number; resolutionTime: number }[] }}
 *          An object containing the station name and an array of its defects (ID and resolution time).
 *          Returns an empty defects array if the station name is not in the predefined list or no defects match.
 */
export function defectsPerStation(defects: Defect[], station: string) {
  const calculatedData: { id: number; resolutionTime: number }[] = [];
  // Predefined list of valid station names (case-insensitive).
  const validStations = [
      "Axle Installation",
      "Dashboard Installation",
      "EV Battery Installation",
      "First Row Seats Installation",
      "Headlight Installation",
      "Rear Bumper Installation",
      "Second Row Seats Installation",
      "Steering Wheel Installation",
      "Tire And Rim Installation",
      "Windshield Installation",
      "Wire Harness Installation",
    ].map((s) => s.toLowerCase());

  console.log(station); // Logging the input station for debugging.

  if (validStations.includes(station.toLowerCase())) {
    defects
      .filter((d) => d.station.toLowerCase() == station.toLowerCase())
      .forEach((d) => {
        calculatedData.push({
          id: d.id, // Assuming Defect type has an 'id' property that is a number.
          resolutionTime: d.resolutionTime,
        });
      });
  }
  return { station, defects: calculatedData };
}
