import type { Defect } from "../apis/defects.api";

/**
 * Calculates a comprehensive set of defect metrics from an array of defect data.
 *
 * This function processes a list of defect objects and computes various statistical
 * measures, including averages, counts, and distributions related to defect
 * resolution times, severities, and occurrences across different categories
 * (e.g., car model, station, part of the car).
 *
 * @param {Defect[]} data - An array of Defect objects. Each object represents a single defect record.
 * @returns {object} An object containing various calculated defect metrics. This includes:
 *  - `overallAvgResolution`: Average resolution time for all defects.
 *  - `avgResolutionPerSeverity`: Average resolution time grouped by severity rating.
 *  - `avgResolutionPerDefect`: Average resolution time grouped by defect name.
 *  - `avgResolutionPerStation`: Average resolution time grouped by station.
 *  - `avgResolutionPerPart`: Average resolution time grouped by part of the car.
 *  - `defectCountPerDefect`: Count of defects for each defect name.
 *  - `defectCountPerModel`: Count of defects for each car model.
 *  - `defectCountPerPart`: Count of defects for each part of the car.
 *  - `defectCountPerShift`: Count of defects for each production shift.
 *  - `mostCommonDefectPerStation`: The most common defect name for each station.
 *  - `severityDistribution`: Distribution of defects by severity rating.
 *  - `avgSeverityPerModel`: Average severity rating grouped by car model.
 *  - `avgSeverityPerStation`: Average severity rating grouped by station.
 *  - `percentRootCauseIdentified`: Percentage of defects where the root cause was identified.
 *  - `rootCausePerDefect`: Percentage of root cause identification grouped by defect name.
 *  - `avgWithRoot`: Average resolution time for defects with an identified root cause.
 *  - `avgWithoutRoot`: Average resolution time for defects without an identified root cause.
 *  - `reportsPerReporter`: Count of defects reported by each reporter.
 *  - `avgSeverityPerReporter`: Average severity of defects reported by each reporter.
 *  - `avgResolutionPerReporter`: Average resolution time of defects reported by each reporter.
 *  - `defectRatePerModel`: Defect count per car model (similar to `defectCountPerModel`).
 *  - `avgMetricsPerModel`: Average severity and resolution time grouped by car model.
 */
export function calculateDefectMetrics(data: Defect[]) {
  const average = (arr: number[]) => {
    const valid = arr.filter((n) => typeof n === "number");
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
  };

  const groupBy = <K extends keyof Defect>(arr: Defect[], key: K) =>
    arr.reduce<Record<string, Defect[]>>((acc, obj) => {
      const value = obj[key].toString();
      if (!acc[value]) acc[value] = [];
      acc[value].push(obj);
      return acc;
    }, {});

  const countBy = <K extends keyof Defect>(arr: Defect[], key: K) =>
    arr.reduce<Record<string, number>>((acc, item) => {
      const val = item[key].toString();
      if (!acc[val]) acc[val] = 0;
      acc[val]++;
      return acc;
    }, {});

  const overallAvgResolution = average(data.map((d) => d.resolutionTime));

  const groupBySeverity = groupBy(data, "severityRating");
  const avgResolutionPerSeverity = Object.entries(groupBySeverity).map(
    ([severityRating, entries]) => ({
      severityRating: Number(severityRating),
      averageResolutionTime: average(entries.map((e) => e.resolutionTime)),
    })
  );

  const avgResolutionPerDefect = Object.entries(
    groupBy(data, "defectName")
  ).map(([name, entries]) => ({
    defectName: name,
    averageResolutionTime: average(entries.map((e) => e.resolutionTime)),
  }));

  const avgResolutionPerStation = Object.entries(groupBy(data, "station")).map(
    ([name, entries]) => ({
      station: name,
      averageResolutionTime: average(entries.map((e) => e.resolutionTime)),
    })
  );

  const avgResolutionPerPart = Object.entries(
    groupBy(data, "partOfTheCar")
  ).map(([name, entries]) => ({
    part: name,
    averageResolutionTime: average(entries.map((e) => e.resolutionTime)),
  }));

  const defectCountPerDefect = countBy(data, "defectName");
  const defectCountPerModel = countBy(data, "carModel");
  const defectCountPerPart = countBy(data, "partOfTheCar");
  const defectCountPerShift = countBy(data, "productionShift");

  const mostCommonDefectPerStation = Object.entries(
    groupBy(data, "station")
  ).reduce<Record<string, string>>((acc, [station, list]) => {
    const freq: Record<string, number> = {};
    list.forEach((e) => {
      freq[e.defectName] = (freq[e.defectName] || 0) + 1;
    });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    acc[station] = top?.[0] || "N/A";
    return acc;
  }, {});

  const severityDistribution = countBy(data, "severityRating");

  const avgSeverityPerModel = Object.entries(groupBy(data, "carModel")).map(
    ([model, list]) => ({
      carModel: model,
      averageSeverity: average(list.map((e) => e.severityRating)),
    })
  );

  const avgSeverityPerStation = Object.entries(groupBy(data, "station")).map(
    ([station, list]) => ({
      station,
      averageSeverity: average(list.map((e) => e.severityRating)),
    })
  );

  const percentRootCauseIdentified =
    (data.filter((e) => e.rootCauseIdentified?.toLowerCase() === "yes").length /
      data.length) *
    100;

  const rootCausePerDefect = Object.entries(groupBy(data, "defectName")).map(
    ([name, list]) => {
      const yesCount = list.filter(
        (e) => e.rootCauseIdentified?.toLowerCase() === "yes"
      ).length;
      return {
        defectName: name,
        percentRootCauseIdentified: (yesCount / list.length) * 100,
      };
    }
  );

  const avgWithRoot = average(
    data
      .filter((e) => e.rootCauseIdentified?.toLowerCase() === "yes")
      .map((e) => e.resolutionTime)
  );
  const avgWithoutRoot = average(
    data
      .filter((e) => e.rootCauseIdentified?.toLowerCase() === "no")
      .map((e) => e.resolutionTime)
  );

  const groupByReporter = groupBy(data, "reporterName");
  const reportsPerReporter = Object.fromEntries(
    Object.entries(groupByReporter).map(([name, list]) => [name, list.length])
  );
  const avgSeverityPerReporter = Object.entries(groupByReporter).map(
    ([name, list]) => ({
      reporterName: name,
      avgSeverity: average(list.map((e) => e.severityRating)),
    })
  );
  const avgResolutionPerReporter = Object.entries(groupByReporter).map(
    ([name, list]) => ({
      reporterName: name,
      avgResolutionTime: average(list.map((e) => e.resolutionTime)),
    })
  );

  const defectRatePerModel = countBy(data, "carModel");
  const avgMetricsPerModel = Object.entries(groupBy(data, "carModel")).map(
    ([model, list]) => ({
      carModel: model,
      avgSeverity: average(list.map((e) => e.severityRating)),
      avgResolutionTime: average(list.map((e) => e.resolutionTime)),
    })
  );

  return {
    overallAvgResolution,
    avgResolutionPerSeverity,
    avgResolutionPerDefect,
    avgResolutionPerStation,
    avgResolutionPerPart,
    defectCountPerDefect,
    defectCountPerModel,
    defectCountPerPart,
    defectCountPerShift,
    mostCommonDefectPerStation,
    severityDistribution,
    avgSeverityPerModel,
    avgSeverityPerStation,
    percentRootCauseIdentified,
    rootCausePerDefect,
    avgWithRoot,
    avgWithoutRoot,
    reportsPerReporter,
    avgSeverityPerReporter,
    avgResolutionPerReporter,
    defectRatePerModel,
    avgMetricsPerModel,
  };
}
