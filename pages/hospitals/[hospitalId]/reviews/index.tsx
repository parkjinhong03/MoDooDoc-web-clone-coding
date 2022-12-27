import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { dehydrate } from "react-query";
import CleanSystemDescription from "../../../../components/CleanSystem/CleanSystemDescription";
import Header from "../../../../components/Layout/Header";
import ReviewFilter from "../../../../components/Review/ReviewFilter";
import ReviewList from "../../../../components/Review/ReviewList";
import ReviewSorter from "../../../../components/Review/ReviewSorter";
import ReviewSummary from "../../../../components/Review/ReviewSummary";
import Divider from "../../../../components/UI/Divider";
import { NotFoundError } from "../../../../hooks/http-api/exceptions";
import { prefetchHospitals, useFetchHospitals } from "../../../../hooks/http-api/fetch-hospitals.hooks";
import { prefetchReviews, useFetchReviews } from "../../../../hooks/http-api/fetch-reviews.hooks";
import { serverSideQueryClient } from "../../../_app";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const searchQuery = context.query.q as string | undefined;
  const hospitalId = parseInt(context.query.hospitalId as string);

  const prefetchHospitalsPromise = prefetchHospitals(serverSideQueryClient);
  const prefetchReviewsPromise = prefetchReviews(serverSideQueryClient, hospitalId, searchQuery);

  await prefetchHospitalsPromise;

  try {
    await prefetchReviewsPromise;
  } catch (err) {
    // NotFoundError 외의 오류가 발생했을지언정 여기서는 NotFoundError 오류만 처리. 그 외 오류는 클라이언트단에서 처리.
    if (err instanceof NotFoundError) {
      return {
        redirect: {
          destination: "/",
          permanent: true,
        },
      };
    }
  }

  return {
    props: {
      dehydratedState: dehydrate(serverSideQueryClient),
    },
  };
}

export default function ReviewListPage() {
  const router = useRouter();
  const searchQuery = router.query.q as string | undefined;
  const hospitalId = parseInt(router.query.hospitalId as string);

  const hospitals = useFetchHospitals();

  const [reviewsQuery] = useFetchReviews(hospitalId, searchQuery);
  const reviews = reviewsQuery.data?.reviews;

  const isLoadedAll = !!(hospitals && reviews);
  const matchedHospitalWithURI = useMemo(
    () => hospitals?.find((hospital) => hospital.id === hospitalId),
    [hospitals, hospitalId] // hospitals은 객체긴 한데 react query 내부적으로 캐싱중이므로 따로 useMemo 사용 X
  );

  const treatmentPricesCountPerName = useMemo(
    () => matchedHospitalWithURI?.treatmentPricesCountPerName,
    [matchedHospitalWithURI]
  );

  return (
    <React.Fragment>
      <Header title={matchedHospitalWithURI?.name || ""} showBackwardBtn={true} />
      {!(isLoadedAll && !!matchedHospitalWithURI) && <p>loading...</p>}
      {/* isLoadedAll===true, matchedHospitalWithURI===false 경우는 없다고 가정. getServerSideProps에서 404일 경우 redirect 처리 했으니. 그럼 왜 조건문 넣었냐? -> 타입 때문에 */}
      {isLoadedAll && !!matchedHospitalWithURI && (
        <React.Fragment>
          <ReviewFilter treatmentPricesCountPerName={treatmentPricesCountPerName!} />
          <ReviewSummary
            totalScore={matchedHospitalWithURI["totalScore"]}
            scoreServiceClarity={matchedHospitalWithURI["scoreServiceClarity"]}
            scoreServiceKindness={matchedHospitalWithURI["scoreServiceKindness"]}
            scoreTreatmentExplain={matchedHospitalWithURI["scoreTreatmentExplain"]}
            scoreTreatmentOutcome={matchedHospitalWithURI["scoreTreatmentOutcome"]}
            suggestCount={matchedHospitalWithURI["suggestCount"]}
            nonSuggestCount={matchedHospitalWithURI["nonSuggestCount"]}
          />
          <Divider />
          <CleanSystemDescription />
          <Divider />
          <ReviewSorter />
          <ReviewList />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
