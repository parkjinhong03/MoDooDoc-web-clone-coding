import Image from "next/image";
import React from "react";
import Hospital from "../../models/hospital.model";
import StarRating from "../UI/StarRating";
import classes from "./ReviewSummary.module.scss";

const ReviewSummary: React.FC<{
  totalScore: Hospital["totalScore"];
  scoreServiceClarity: Hospital["scoreServiceClarity"];
  scoreServiceKindness: Hospital["scoreServiceKindness"];
  scoreTreatmentExplain: Hospital["scoreTreatmentExplain"];
  scoreTreatmentOutcome: Hospital["scoreTreatmentOutcome"];
  suggestCount: Hospital["suggestCount"];
  nonSuggestCount: Hospital["nonSuggestCount"];
}> = (props) => {
  return (
    <div className={classes["review-summary"]}>
      <div className={classes["review-summary-header"]}>
        <p>리뷰 정보</p>
      </div>
      <div className={classes["review-summary-content"]}>
        <ReviewItemAverageList
          scoreServiceClarity={props.scoreServiceClarity}
          scoreServiceKindness={props.scoreServiceKindness}
          scoreTreatmentExplain={props.scoreTreatmentExplain}
          scoreTreatmentOutcome={props.scoreTreatmentOutcome}
        />

        <ReviewTotalAverage
          totalScore={props.totalScore}
          suggestCount={props.suggestCount}
          nonSuggestCount={props.nonSuggestCount}
        />
      </div>
    </div>
  );
};

const ReviewItemAverageList: React.FC<{
  scoreServiceClarity: number;
  scoreServiceKindness: number;
  scoreTreatmentExplain: number;
  scoreTreatmentOutcome: number;
}> = (props) => {
  const reviewItemAverages = [
    { itemName: "자세한 설명", average: props.scoreTreatmentExplain },
    { itemName: "적절한 금액", average: 0 },
    { itemName: "진료후 결과", average: props.scoreTreatmentOutcome },
    { itemName: "직원의 친절", average: props.scoreServiceKindness },
    { itemName: "짧은 대기시간", average: 0 },
    { itemName: "청결함", average: props.scoreServiceClarity },
  ];

  return (
    <div className={classes["item-list"]}>
      {reviewItemAverages.map(({ itemName, average }) => (
        <ReviewItemAverage key={encodeURI(itemName)} itemName={itemName} average={average} />
      ))}
    </div>
  );
};

const ReviewItemAverage: React.FC<{
  itemName: string;
  average: number;
}> = (props) => {
  return (
    <div className={classes["item"]}>
      <div className={classes["item-header"]}>
        <p>{props.itemName}</p>
      </div>
      <div className={classes["divider"]} />
      <div className={classes["star-rating-container"]}>
        <StarRating score={props.average} />
      </div>
    </div>
  );
};

const ReviewTotalAverage: React.FC<{
  totalScore: number;
  suggestCount: number;
  nonSuggestCount: number;
}> = (props) => {
  return (
    <div className={classes["total"]}>
      <div className={classes["average"]}>
        <div className={classes["average-header"]}>
          <p>별점 평균</p>
        </div>
        <div className={classes["average-content"]}>
          <p>{props.totalScore.toFixed(1)}</p>
          <p>/</p>
          <p>10</p>
        </div>
      </div>
      <div className={classes["suggestion"]}>
        <div className={classes["suggest-yes-count-box"]}>
          <Image src="/img/face_suggest.svg" alt="face_suggest" width={20} height={20} />
          <div className={classes["count"]}>
            <p>{props.suggestCount}</p>
          </div>
        </div>
        <div className={classes["suggest-no-count-box"]}>
          <Image src="/img/face_not_suggest.svg" alt="face_not_suggest" width={20} height={20} />
          <div className={classes["count"]}>
            <p>{props.nonSuggestCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;
