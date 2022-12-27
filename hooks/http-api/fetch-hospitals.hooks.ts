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

async function fetchHospitalList(): Promise<Hospital[]> {
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

  return hospitals;
}

export interface HospitalsQueryDataType {
  hospitals: Hospital[];
}

export async function prefetchHospitals(queryClient: QueryClient) {
  const queryKey = QueryKeyManager[QueryType.Hospitals].createKey();
  await queryClient.prefetchQuery(
    queryKey,
    async (): Promise<HospitalsQueryDataType> => ({
      hospitals: await fetchHospitalList(),
    })
  );
}

export function useFetchHospitals() {
  const queryKey = QueryKeyManager[QueryType.Hospitals].createKey();
  const query = useQuery(
    queryKey,
    async (): Promise<HospitalsQueryDataType> => ({
      hospitals: await fetchHospitalList(),
    })
  );

  // isLoading과 isFetching의 차이는, 캐시가 있냐 없냐 차이.
  //   - isFetching은 이전에 캐싱된게 있는채로 refetch가 걸렸을 때. 그래서 캐싱된 값을 먼저 반환한 후, 백그라운드에서 fetch 실행 후 다시 반환 (총 2번 리렌더링)
  //   - isLoading은 첫 fetch or cacheTime가 지나 캐시가 삭제된채로 refetch가 걸렸을 때.
  // 따라서 isFetching이 True면 data는 있는 상태이고, 비동기 종료 후 업데이트된 데이터로 재렌더링 됨. isLoading이 True이면 hospitals이 없는 상태이고 비동기 종료 후 신규 데이터로 재렌더링 됨.

  // useQuery에 넘겨준 콜백이 error를 뱉으면 retryDelay 마다 retry 수만큼 재조회. 그 때 까지는 isLoading or isFetching으로 옴.
  // 만약 마지막 retry에서도 error를 뱉으면 그 때 isError이 True로 옴. 에러 정보는 error 변수에 담겨오고, 만약 useErrorBoundary가 True면 error가 throw된 채로 온다(try 해줘야 함)

  // 여긴 SSR이니 첫 접속 이후에 isFetching or isLoading이 true로 들어올 수 있는 가능성을 정리해보면
  //   - staleTime에 걸려 stale 상태가 된 이후 onWindowFocus, onMount, onReconnect 발생 or refetch() or invalidateQueries() -> isFetching
  //     (하지만 prefetchQuery와 useQuery의 staleTime 시간이 같다면 onAmount는 발생할 가능성이 없음)
  //     (상태가 stale로 바뀌는 것 자체만으로는 refetch가 일어나지 않음.)
  //   - 그 중에서도 캐시가 없는 상태 -> isLoading (useQuery에서 생성된 쿼리가 cacheTime 동안 unmount 상태를 계속 유지하면 캐시가 삭제된다.)
  //     (cacheTime가 staleTime보다 작으면 아직 stale이 안됐더라도 cacheTime에 걸려 cache가 삭제된 상태일 수도 있음. 그러면 당연히 새로 refetch 해옴.)

  // 그럼 여긴 SSR이니 첫 접속(or 리프레쉬)시에는 무조건 isFetching, isLoading 둘 다 모두 False인가?
  //  -> ㄴㄴ. useQuery 호출 시점이 'prefetchQuery가 호출된 시점 기준 cacheTime 이후의 시점'이라면 캐시가 삭제된 상태이기 때문에 isLoading으로 들어옴 (더 자세한 설명은 호출부에)
  //  -> 참고로 isFetching으로 들어올 리는 없음. prefetchQuery는 useQuery와 다르게, 캐시가 있어도 그 캐시가 stale 상태라면 fetch를 foreground에서 돌리고 한 번에 반환하기 때문에.
  //     (하지만 그렇게 반환했어도 cacheTime에 걸려서 isLoading으로 될 수도 있음)

  return query.data?.hospitals;
}
