import { QueryClient, useQuery, useQueryClient } from "react-query";
import Review from "../../models/review.model";
import { NotFoundError } from "./exceptions";
import { ReviewsQueryDataType, updateReviewList } from "./fetch-reviews.hooks";
import { QueryKeyManager, QueryType } from "./query-keys";

interface FetchReviewAPIResponse {
  review: {
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
  };
}

async function fetchReview(hospitalId: number, reviewId: number): Promise<Review> {
  const aceessToken = "WOttAMeBZi2yR3XImaEzIOCqrDBD9k";
  const responseData = await fetch(`https://recruit.modoodoc.com/hospitals/${hospitalId}/reviews/${reviewId}`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${aceessToken}`,
    },
  });

  // 해당 오류는 ClientSide가 아닌 ServerSide에서 처리한다(getServerSideProps에서). 렌더링 전에 리다이렉션 처리해야하기 때문.
  if (responseData.status === 404) {
    throw new NotFoundError();
  }

  const data: FetchReviewAPIResponse = await responseData.json();
  const review: Review = ((review) => ({
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
  }))(data.review);

  return review;
}

export interface ReviewQueryDataType {
  review: Review;
}

export async function prefetchReview(queryClient: QueryClient, hospitalId: number, reviewId: number) {
  const queryKey = QueryKeyManager[QueryType.Review].createKey(hospitalId, reviewId);
  await queryClient.fetchQuery(
    queryKey,
    async (): Promise<ReviewQueryDataType> => ({
      review: await fetchReview(hospitalId, reviewId),
    })
  );
}

export function updateReview(
  queryClient: QueryClient,
  hospitalId: number,
  reviewId: number,
  updateReviewFunc: (review: Review) => void
) {
  const queryKey = QueryKeyManager[QueryType.Review].createKey(hospitalId, reviewId);
  const data = queryClient.getQueryData(queryKey);
  const review = (data as ReviewQueryDataType | undefined)?.review;
  if (review) {
    updateReviewFunc(review);
    queryClient.setQueryData(queryKey, data);
  }
}

export function useFetchReview(hospitalId: number, reviewId: number) {
  const queryClient = useQueryClient();

  const queryKey = QueryKeyManager[QueryType.Review].createKey(hospitalId, reviewId);
  const query = useQuery(
    queryKey,
    async (): Promise<ReviewQueryDataType> => ({
      review: await fetchReview(hospitalId, reviewId),
    })
  );

  const updateReviewInReviewQuery = (updateReviewFunc: (review: Review) => void) => {
    updateReviewList(queryClient, hospitalId, reviewId, updateReviewFunc);
    updateReview(queryClient, hospitalId, reviewId, updateReviewFunc);
  };

  return [query, updateReviewInReviewQuery] as const;
}
