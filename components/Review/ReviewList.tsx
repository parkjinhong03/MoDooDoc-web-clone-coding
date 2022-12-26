import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFetchReviews } from "../../hooks/http-api/fetch-reviews.hooks";
import Review from "../../models/review.model";
import Divider from "../UI/Divider";
import ReviewAuthor from "./ReviewAuthor";
import ReviewContent from "./ReviewContent";

import classes from "./ReviewList.module.scss";

const ReviewList = () => {
  const router = useRouter();
  const searchQuery = router.query.q as string | undefined;
  const hospitalId = parseInt(router.query.hospitalId as string);

  const [reviewsQuery, fetchMorePage, updateReviewInAllReviewsQueries] = useFetchReviews(hospitalId, searchQuery);
  const { reviews, loadedPage, isFetchedAllPage, isFetchingMorePage } = reviewsQuery.data!;
  const reviewsQueryData = useMemo(
    () => ({
      reviews: reviews,
      loadedPage: loadedPage,
      isFetchingMorePage: isFetchingMorePage,
      isFetchedAllPage: isFetchedAllPage,
    }),
    [reviews, loadedPage, isFetchingMorePage, isFetchedAllPage]
  );

  const bottomElement = useRef(null);

  const bottomElementIntersectHandler: IntersectionObserverCallback = useCallback(
    async ([entry]) => {
      if (entry.isIntersecting && !reviewsQueryData.isFetchingMorePage && !reviewsQueryData.isFetchedAllPage) {
        await fetchMorePage(reviewsQueryData.loadedPage + 1);
      }
    },
    [reviewsQueryData, fetchMorePage]
  );

  useEffect(() => {
    if (!bottomElement.current) {
      return;
    }

    const observer = new IntersectionObserver(bottomElementIntersectHandler, {
      rootMargin: "500px",
    });
    observer.observe(bottomElement.current);

    return () => observer.disconnect();
  }, [bottomElement, bottomElementIntersectHandler]);

  const isUsefulBtnClickHandler = (reviewId: Review["id"]) => {
    updateReviewInAllReviewsQueries(reviewId, (review) => {
      review.likedCnt = review.likedCnt + (review.alreadyLiked ? -1 : 1);
      review.alreadyLiked = !review.alreadyLiked;
    });
  };

  return (
    <div className={classes["review-list"]}>
      {reviewsQueryData.reviews.map((review) => (
        <div key={review.id} className={classes["review-detail-container"]}>
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
          <div className={classes["divider"]} />
          <ReviewAuthor
            id={review.id}
            customer={review.customer}
            hospitalId={review.hospitalId}
            registeredAt={review.registeredAt}
            likedCnt={review.likedCnt}
            alreadyLiked={review.alreadyLiked}
            viewIsUsefulBtn={true}
            isUsefulBtnOnClick={isUsefulBtnClickHandler.bind(review.id)}
          />
        </div>
      ))}
      <Divider />
      <div ref={bottomElement} />
    </div>
  );
};

export default ReviewList;
