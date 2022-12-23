import { QueryClient, QueryKey, useQuery } from "react-query";
import Review from "../../models/review.model";
import { NotFoundError } from "./exceptions";
import { QueryKeyManager, QueryType } from "./query-keys";

interface FetchReviewListAPIResponse {
  reviews: Review[];
}

async function fetchReviewList(hospitalId: number, searchQuery?: string): Promise<FetchReviewListAPIResponse> {
  const searchParams: {
    search_query?: string;
  } = {};
  if (searchQuery) searchParams.search_query = searchQuery;

  const aceessToken = "WOttAMeBZi2yR3XImaEzIOCqrDBD9k";
  const responseData = await fetch(
    `https://recruit.modoodoc.com/hospitals/${hospitalId}/reviews/?${new URLSearchParams(searchParams).toString()}`,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${aceessToken}`,
      },
    }
  );

  // 해당 오류는 ClientSide가 아닌 ServerSide에서 처리한다(getServerSideProps에서). 렌더링 전에 리다이렉션 처리해야하기 때문.
  if (responseData.status === 404) {
    throw new NotFoundError();
  }

  return await responseData.json();
}

export async function prefetchReviews(queryClient: QueryClient, hospitalId: number, searchQuery?: string) {
  const queryKey = QueryKeyManager[QueryType.Reviews].createKey(hospitalId, searchQuery);

  // fetchQuery는 prefetchQuery와 다르게 fecth 결과를 반환하고 에러가 발생하며 그걸 내뱉는다. 밖에서 에러를 처리하지 않을거라면 prefetchQuery 사용하는게 안전함.
  await queryClient.fetchQuery(queryKey, () => fetchReviewList(hospitalId, searchQuery));
}

export function useFetchReviews(hospitalId: number, searchQuery?: string) {
  const queryKey = QueryKeyManager[QueryType.Reviews].createKey(hospitalId, searchQuery);
  const query = useQuery(queryKey, () => fetchReviewList(hospitalId, searchQuery));
  return query;
}
