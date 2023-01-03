import { GetServerSidePropsContext } from "next";
import { prefetchHospitals, useFetchHospitals } from "../../../../hooks/http-api/fetch-hospitals.hooks";
import { prefetchReview, useFetchReview } from "../../../../hooks/http-api/fetch-review.hooks";
import { serverSideQueryClient } from "../../../_app";
import { NotFoundError } from "../../../../hooks/http-api/exceptions";
import { dehydrate } from "react-query";
import { useRouter } from "next/router";
import React from "react";
import Header from "../../../../components/Layout/Header";
import ReviewDetail from "../../../../components/Review/ReviewDetail";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const hospitalId = parseInt(context.query.hospitalId as string);
  const reviewId = parseInt(context.query.reviewId as string);

  const prefetchHospitalsPromise = prefetchHospitals(serverSideQueryClient);
  const prefetchReviewPromise = prefetchReview(serverSideQueryClient, hospitalId, reviewId);

  await prefetchHospitalsPromise;

  try {
    await prefetchReviewPromise;
  } catch (err) {
    if (err instanceof NotFoundError) {
      return {
        redirect: {
          destination: ``,
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

const ReviewDetailPage = () => {
  const router = useRouter();
  const hospitalId = parseInt(router.query.hospitalId as string);
  const reviewId = parseInt(router.query.reviewId as string);

  const hospitalsQuery = useFetchHospitals();
  const hospitals = hospitalsQuery.data?.hospitals;

  const [reviewQuery] = useFetchReview(hospitalId, reviewId);
  const review = reviewQuery.data?.review;

  const isLoadedAll = !!(hospitals && review);
  const matchedHospitalWithURI = hospitals?.find((hospital) => hospital.id === hospitalId);

  return (
    <React.Fragment>
      <Header title={matchedHospitalWithURI?.name || ""} showBackwardBtn={true} />
      {!(isLoadedAll && matchedHospitalWithURI) && <p>loading...</p>}
      {isLoadedAll && matchedHospitalWithURI && <ReviewDetail />}
    </React.Fragment>
  );
};

export default ReviewDetailPage;
