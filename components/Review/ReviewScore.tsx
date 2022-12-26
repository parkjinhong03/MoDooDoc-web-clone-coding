import React from "react";
import Review from "../../models/review.model";
import StarRating from "../UI/StarRating";
import classes from "./ReviewScore.module.scss";

const ReviewScore: React.FC<{
  scoreTreatmentExplain: Review["scoreTreatmentExplain"];
  scoreTreatmentOutcome: Review["scoreTreatmentOutcome"];
  scoreServiceKindness: Review["scoreServiceKindness"];
  scoreServiceClarity: Review["scoreServiceClarity"];
}> = (props) => {
  const reviewItemAveragesList = [
    [
      { itemName: "진료의 효과", average: props.scoreTreatmentOutcome },
      { itemName: "직원의 친절", average: props.scoreServiceKindness },
    ],
    [
      { itemName: "의사의 친절", average: props.scoreTreatmentExplain },
      { itemName: "청결함", average: props.scoreServiceClarity },
    ],
  ];

  return (
    <div className={classes["review-score"]}>
      {reviewItemAveragesList.map((reviewItemAverages, index) => (
        <div key={index} className={classes["item-name-and-score-with-star-row"]}>
          {reviewItemAverages.map(({ itemName, average }) => (
            <ItemNameAndScoreWithStar key={encodeURI(itemName)} itemName={itemName} score={average} />
          ))}
        </div>
      ))}
    </div>
  );
};

const ItemNameAndScoreWithStar: React.FC<{ itemName: string; score: number }> = (props) => {
  return (
    <div className={classes["item-name-and-score-with-star"]}>
      <div className={classes["item-name"]}>
        <p>{props.itemName}</p>
      </div>
      <StarRating score={props.score} />
    </div>
  );
};

export default ReviewScore;
