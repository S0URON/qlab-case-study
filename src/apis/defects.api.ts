export const getDefectsApi = async (): Promise<Defect[]> => {
  const response = await fetch("http://localhost:3000/defects", {
    method: "GET",
  });
  const data = await response.json();
  return data;
};

export interface Defect {
  id: number;
  date: string;
  time: string;
  defectName: string;
  station: string;
  partOfTheCar: string;
  reporterName: string;
  partNumber: number;
  severityRating: number;
  carModel: string;
  motorType: string;
  designPackage: string;
  productionShift: string;
  resolutionTime: number;
  rootCauseIdentified: string;
  defectCategory: string;
  [key: string]: string | number;
}
