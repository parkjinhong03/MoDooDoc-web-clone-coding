export default interface Hospital {
  id: number;
  name: string;
  totalScore: number;
  scoreServiceClarity: number;
  scoreServiceKindness: number;
  scoreTreatmentExplain: number;
  scoreTreatmentOutcome: number;
  suggestCount: number;
  nonSuggestCount: number;
  treatmentPricesCountPerName: {
    name: string;
    count: number;
  }[];
}
