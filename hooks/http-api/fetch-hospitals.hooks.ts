import { QueryClient, useQuery } from "react-query";
import Hospital from "../../models/hospital.model";
import { QueryKeyManager, QueryType } from "./query-keys";

interface FetchHospitalListAPIResponse {
  hospitals: {
    id: number;
    name: string;
    total_score: number;
    score_service_clarity: number;
    score_service_kindness: number;
    score_treatment_explain: number;
    score_treatment_outcome: number;
    treatment_prices_count_per_name: {
      name: string;
      count: number;
    }[];
  }[];
}

async function fetchHospitalList(): Promise<{ hospitals: Hospital[] }> {
  const aceessToken = "WOttAMeBZi2yR3XImaEzIOCqrDBD9k";
  const responseData = await fetch("https://recruit.modoodoc.com/hospitals/", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${aceessToken}`,
    },
  });

  const data: FetchHospitalListAPIResponse = await responseData.json();
  const hospitals: Hospital[] = data.hospitals.map((hospital) => ({
    id: hospital.id,
    name: hospital.name,
    totalScore: hospital.total_score,
    scoreServiceClarity: hospital.score_service_clarity,
    scoreServiceKindness: hospital.score_service_kindness,
    scoreTreatmentExplain: hospital.score_treatment_explain,
    scoreTreatmentOutcome: hospital.score_treatment_outcome,
    suggestCount: 0,
    nonSuggestCount: 0,
    treatmentPricesCountPerName: hospital.treatment_prices_count_per_name.map(({ name, count }) => ({
      name: name,
      count: count,
    })),
  }));

  return {
    hospitals: hospitals,
  };
}

export async function prefetchHospitals(queryClient: QueryClient) {
  const queryKey = QueryKeyManager[QueryType.Hospitals].createKey();
  await queryClient.prefetchQuery(queryKey, fetchHospitalList);
}

export function useFetchHospitals() {
  const queryKey = QueryKeyManager[QueryType.Hospitals].createKey();
  const query = useQuery(queryKey, fetchHospitalList);
  return query;
}
