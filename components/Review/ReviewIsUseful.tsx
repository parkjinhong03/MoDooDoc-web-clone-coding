import Image from "next/image";
import React from "react";
import Review from "../../models/review.model";
import classes from "./ReviewIsUseful.module.scss";

const ReviewIsUseful: React.FC<{
  likedCnt: Review["likedCnt"];
  alreadyLiked: Review["alreadyLiked"];
  isUsefulBtnOnClick: () => void;
}> = (props) => {
  return (
    <div className={classes["review-is-useful"]}>
      <div className={classes["useful-count"]}>
        <p>
          <span className={classes["highlight"]}>{props.likedCnt}</span>명의 회원에게 도움이 되었어요!
        </p>
      </div>
      <div className={classes["useful-btn"]} onClick={props.isUsefulBtnOnClick}>
        <Image
          src={props.alreadyLiked ? "/img/heart_yellow_fill.svg" : "/img/heart_yellow_blank.svg"}
          alt="heart_yellow_blank"
          width={16}
          height={16}
        />
        <p>도움이 되었어요</p>
      </div>
    </div>
  );
};

export default ReviewIsUseful;
