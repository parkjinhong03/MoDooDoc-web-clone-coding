import { useCallback, useMemo } from "react";
import { QueryClient, useQuery, useQueryClient } from "react-query";
import Review from "../../models/review.model";
import { NotFoundError } from "./exceptions";
import { updateReview } from "./fetch-review.hooks";
import { QueryKeyManager, QueryType } from "./query-keys";

interface FetchReviewListAPIResponse {
  reviews: {
    id: number;
    customer: {
      id: number;
      profile_image: string;
      nickname: string;
      review_cnt: number;
      liked_cnt: number;
    }; // Review를 통하지 않고도 사용할 수 있어야할 확률이 있는 nested object는 Type 따로 분리
    hospital_id: number;
    hospital_name: string;
    doctor_id: number;
    doctor_name: string;
    total_score: number;
    score_service_clarity: number;
    score_service_kindness: number;
    score_treatment_explain: number;
    score_treatment_outcome: number;
    registered_at: string;
    visited_at: string;
    treatment_prices: {
      name: string;
      price: number;
    }[];
    contents: string;
    suggest: boolean;
    liked_cnt: number;
    already_liked: boolean;
  }[];
}

async function fetchReviewList(hospitalId: number, searchQuery?: string, page?: number): Promise<Review[]> {
  const searchParams: {
    search_query?: string;
    page?: string;
  } = {};
  if (searchQuery) searchParams.search_query = searchQuery;
  if (page) searchParams.page = page.toString();

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

  const data: FetchReviewListAPIResponse = await responseData.json();
  const reviews: Review[] = data.reviews.map((review) => ({
    id: review.id,
    customer: {
      id: review.customer.id,
      profileImage: review.customer.profile_image,
      nickname: review.customer.nickname,
      reviewCnt: review.customer.review_cnt,
      likedCnt: review.customer.liked_cnt,
    },
    hospitalId: review.hospital_id,
    hospitalName: review.hospital_name,
    doctorId: review.doctor_id,
    doctorName: review.doctor_name,
    totalScore: review.total_score,
    scoreServiceClarity: review.score_service_clarity,
    scoreServiceKindness: review.score_service_kindness,
    scoreTreatmentExplain: review.score_treatment_explain,
    scoreTreatmentOutcome: review.score_treatment_outcome,
    registeredAt: review.registered_at,
    visitedAt: review.visited_at,
    treatmentPrices: review.treatment_prices.map(({ name, price }) => ({ name: name, price: price })),
    contents: review.contents,
    suggest: review.suggest,
    likedCnt: review.liked_cnt,
    alreadyLiked: review.already_liked,
  }));

  return reviews;
}

export interface ReviewsQueryDataType {
  reviews: Review[];
  loadedPage: number;
  isFetchedAllPage: boolean;
  isFetchingMorePage: boolean;
}

export async function prefetchReviews(queryClient: QueryClient, hospitalId: number, searchQuery?: string) {
  const queryKey = QueryKeyManager[QueryType.Reviews].createKey(hospitalId, searchQuery);

  // fetchQuery는 prefetchQuery와 다르게 fecth 결과를 반환하고 에러가 발생하며 그걸 내뱉는다. 밖에서 에러를 처리하지 않을거라면 prefetchQuery 사용하는게 안전함.
  const fetchedData = await queryClient.fetchQuery(
    queryKey,
    async (): Promise<ReviewsQueryDataType> => ({
      reviews: await fetchReviewList(hospitalId, searchQuery),
      loadedPage: 1,
      isFetchedAllPage: false,
      isFetchingMorePage: false,
    })
  );
  return fetchedData;
}

export function updateReviewList(
  queryClient: QueryClient,
  hospitalId: number,
  reviewId: number,
  updateReviewFunc: (review: Review) => void
) {
  // 현재 존재하는 모든 Query에 업데이트.
  // queryKey [1]로 조회하면 [1] 뿐만 아니라 [1, 2]나 [1, 2, 3] 등 모두 조회됨.
  queryClient
    .getQueriesData(QueryKeyManager[QueryType.Reviews].createRootKey(hospitalId))
    .forEach(([queryKey, data]) => {
      const matchedReview = (data as ReviewsQueryDataType | undefined)?.reviews?.find(
        (review) => review.id === reviewId
      );
      if (matchedReview) {
        updateReviewFunc(matchedReview);
        queryClient.setQueryData(queryKey, data);
      }
    });
}

export function useFetchReviews(hospitalId: number, searchQuery?: string) {
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => QueryKeyManager[QueryType.Reviews].createKey(hospitalId, searchQuery),
    [hospitalId, searchQuery]
  );

  const query = useQuery(
    queryKey,
    async (): Promise<ReviewsQueryDataType> => ({
      reviews: await fetchReviewList(hospitalId, searchQuery),
      loadedPage: 1,
      isFetchedAllPage: false,
      isFetchingMorePage: false,
    })
  );

  const fetchMorePage = useCallback(
    async (page: number) => {
      const originData: ReviewsQueryDataType | undefined = queryClient.getQueryData(queryKey);
      if (!originData) {
        return;
      }
      queryClient.setQueryData(queryKey, {
        ...originData,
        isFetchingMorePage: true,
      });

      const moreLoadedReviews = await fetchReviewList(hospitalId, searchQuery, page);

      const newData: ReviewsQueryDataType = {
        reviews: originData.reviews.concat(moreLoadedReviews),
        loadedPage: page,
        isFetchedAllPage: !moreLoadedReviews.length,
        isFetchingMorePage: false,
      };
      queryClient.setQueryData(queryKey, newData);

      const isLoadedAll = !moreLoadedReviews.length;
      return isLoadedAll;
    },
    [hospitalId, queryClient, queryKey, searchQuery]
  );

  const updateReviewInAllReviewQueries = (reviewId: number, updateReviewFunc: (review: Review) => void) => {
    updateReviewList(queryClient, hospitalId, reviewId, updateReviewFunc);
    updateReview(queryClient, hospitalId, reviewId, updateReviewFunc);
  };

  return [query, fetchMorePage, updateReviewInAllReviewQueries] as const;
}
