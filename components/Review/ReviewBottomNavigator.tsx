import { useRouter } from "next/router";
import classes from "./ReviewBottomNavigator.module.scss";

const ReviewBottomNavigator: React.FC<{
  hospitalId: number;
  prevReviewId?: number;
  nextReviewId?: number;
}> = (props) => {
  const router = useRouter();
  const [path, paramsStr] = router.asPath.split("?");
  const params = new URLSearchParams(paramsStr);

  const viewReviewBtnClickHandler = (reviewId: number) => {
    router.replace(`/hospitals/${props.hospitalId}/reviews/${reviewId}?${params.toString()}`);
  };

  return (
    <div className={classes["review-bottom-navigator"]}>
      {!!props.prevReviewId ? (
        <div className={classes["link-to-review-btn"]} onClick={() => viewReviewBtnClickHandler(props.prevReviewId!)}>
          <p>이전 리뷰</p>
        </div>
      ) : (
        <div className={classes["fake-box"]} />
      )}
      {!!props.nextReviewId ? (
        <div className={classes["link-to-review-btn"]} onClick={() => viewReviewBtnClickHandler(props.nextReviewId!)}>
          <p>다음 리뷰</p>
        </div>
      ) : (
        <div className={classes["fake-box"]} />
      )}
    </div>
  );
};

export default ReviewBottomNavigator;
