import { useRouter } from "next/router";
import ReactDOM from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFetchReview } from "../../hooks/http-api/fetch-review.hooks";
import { useFetchReviews } from "../../hooks/http-api/fetch-reviews.hooks";
import ReviewAuthor from "./ReviewAuthor";
import ReviewBottomNavigator from "./ReviewBottomNavigator";
import ReviewContent from "./ReviewContent";

import classes from "./ReviewDetail.module.scss";
import ReviewIsUseful from "./ReviewIsUseful";
import ReviewScore from "./ReviewScore";

const ReviewDetail = () => {
  const router = useRouter();
  const searchQuery = router.query.q as string | undefined;
  const hospitalId = parseInt(router.query.hospitalId as string);
  const reviewId = parseInt(router.query.reviewId as string);

  const [reviewQuery, updateReviewInAllReviewsQueries] = useFetchReview(hospitalId, reviewId);
  const review = reviewQuery.data!.review;

  const [reviewsQuery, fetchMorePage] = useFetchReviews(hospitalId, searchQuery);
  const { reviews, loadedPage, isFetchedAllPage } = reviewsQuery.data || {};
  const reviewsQueryData = useMemo(
    () => ({
      reviews: reviews,
      loadedPage: loadedPage,
      isFetchedAllPage: isFetchedAllPage,
    }),
    [reviews, loadedPage, isFetchedAllPage]
  );

  const [prevReviewId, setPrevReviewId] = useState<number | undefined>(undefined);
  const [nextReviewId, setNextReviewId] = useState<number | undefined>(undefined);

  const loadPrevAndNextReview = useCallback(() => {
    if (!(reviewsQueryData && reviewsQueryData.reviews && reviewsQueryData.loadedPage)) {
      return;
    }

    const matchReviewIndex = reviewsQueryData.reviews.findIndex((review) => review.id === reviewId);
    if (matchReviewIndex !== -1) {
      if (reviewsQueryData.reviews[matchReviewIndex + 1] === undefined && !reviewsQueryData.isFetchedAllPage) {
        fetchMorePage(reviewsQueryData.loadedPage + 1);
      } else {
        setPrevReviewId(reviewsQueryData.reviews[matchReviewIndex - 1]?.id);
        setNextReviewId(reviewsQueryData.reviews[matchReviewIndex + 1]?.id);
      }
    } else {
      fetchMorePage(reviewsQueryData.loadedPage + 1);
    }
  }, [reviewsQueryData, fetchMorePage, reviewId]);

  useEffect(loadPrevAndNextReview, [loadPrevAndNextReview]);

  const isUsefulBtnClickHandler = () => {
    updateReviewInAllReviewsQueries((review) => {
      review.likedCnt = review.likedCnt + (review.alreadyLiked ? -1 : 1);
      review.alreadyLiked = !review.alreadyLiked;
    });
  };

  return (
    <div className={classes["review-detail"]}>
      <ReviewAuthor
        id={review.id}
        customer={review.customer}
        hospitalId={review.hospitalId}
        registeredAt={review.registeredAt}
        likedCnt={review.likedCnt}
        alreadyLiked={review.alreadyLiked}
        viewIsUsefulBtn={false}
      />
      <div className={classes["divider"]} />
      <div className={classes["review-content-container"]}>
        <ReviewContent
          id={review.id}
          hospitalId={review.hospitalId}
          doctorName={review.doctorName}
          visitedAt={review.visitedAt}
          totalScore={review.totalScore}
          treatmentPrices={review.treatmentPrices}
          contents={review.contents}
          suggest={review.suggest}
        />
      </div>
      <ReviewScore
        scoreServiceClarity={review.scoreServiceClarity}
        scoreServiceKindness={review.scoreServiceKindness}
        scoreTreatmentExplain={review.scoreTreatmentExplain}
        scoreTreatmentOutcome={review.scoreTreatmentOutcome}
      />
      <div className={classes["review-is-useful-container"]}>
        <ReviewIsUseful
          likedCnt={review.likedCnt}
          alreadyLiked={review.alreadyLiked}
          isUsefulBtnOnClick={isUsefulBtnClickHandler}
        />
      </div>
      {(prevReviewId || nextReviewId) &&
        ReactDOM.createPortal(
          <ReviewBottomNavigator hospitalId={hospitalId} prevReviewId={prevReviewId} nextReviewId={nextReviewId} />,
          document.getElementById("review-bottom-ravigator")!
        )}

      {/* {isOpenCleanSystemModal &&
        } */}
    </div>
  );
};

export default ReviewDetail;
