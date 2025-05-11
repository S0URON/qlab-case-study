export const flagAnomalyApi = async (anomaly: Anomaly): Promise<Anomaly> => {
  const response = await fetch("http://localhost:3000/anomalies", {
    method: "POST",
    body: JSON.stringify(anomaly),
  });
  const data = await response.json();
  return data;
};

export const getAnomaliesApi = async (): Promise<Anomaly[]> => {
  const response = await fetch("http://localhost:3000/anomalies", {
    method: "GET",
  });
  const data = await response.json();
  return data;
};

export const unflagAnomalyApi = async (id: string): Promise<Anomaly> => {
  const response = await fetch(`http://localhost:3000/anomalies/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
};

export interface Anomaly {
  id: string;
  status: string;
  note: string;
  defectId: number;
  date: Date;
  time: string;
  flaggedBy: string;
  suspectedValue: string;
  suspectedField: string;
}
