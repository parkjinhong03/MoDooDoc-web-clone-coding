import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import reactStringReplace from "react-string-replace";
import Review from "../../models/review.model";
import StarRating from "../UI/StarRating";
import classes from "./ReviewContent.module.scss";

const ReviewContent: React.FC<{
  id: Review["id"];
  hospitalId: Review["hospitalId"];
  doctorName: Review["doctorName"];
  totalScore: Review["totalScore"];
  visitedAt: Review["visitedAt"];
  treatmentPrices: Review["treatmentPrices"];
  contents: Review["contents"];
  suggest: Review["suggest"];
}> = (props) => {
  const [isViewMore, setIsViewMore] = useState(false);

  const router = useRouter();
  const searchQuery = router.query.q as string | undefined;

  const treatmentName = props.treatmentPrices.map(({ name }) => name).join(",");
  const treatmentPrice = props.treatmentPrices.map(({ price }) => price).reduce((a, b) => a + b);

  const convertHighlightText = (content: string, highlighText: string) => {
    return reactStringReplace(content, highlighText, (match, i) => (
      <span key={i} className={classes["highlight"]}>
        {match}
      </span>
    ));
  };
  const contents = searchQuery ? convertHighlightText(props.contents, searchQuery) : props.contents;

  return (
    <div className={classes["review-content"]}>
      <div className={classes["link-to-detail-page"]}>
        <Link href={`/hospitals/${props.hospitalId}/reviews/${props.id}?q=${searchQuery || ""}`}>
          <div className={classes["receipt-ok"]}>
            <Image src="/img/white_check.svg" alt="white_check" width={10} height={8} />
            <p>영수증 인증</p>
          </div>
          <div className={classes["header"]}>
            <div className={classes["treatment"]}>
              <p>받은 진료 : {treatmentName}</p>
            </div>
            <div className={classes["score-and-suggest-and-visited-at"]}>
              <div className={classes["score-container"]}>
                <StarRating score={props.totalScore} />
                <div className={classes["score"]}>
                  <p>{props.totalScore.toFixed(1)}</p>
                </div>
              </div>
              <div className={classes["divider"]} />
              {props.suggest ? (
                <div className={classes["suggest"]}>
                  <p>재방문 의사 있음</p>
                </div>
              ) : (
                <div className={classes["non-suggest"]}>
                  <p>재방문 의사 없음</p>
                </div>
              )}
              {!!props.visitedAt && (
                <React.Fragment>
                  <div className={classes["divider"]} />
                  <div className={classes["visited-at"]}>
                    <p>{props.visitedAt}년 전 방문</p>
                  </div>
                </React.Fragment>
              )}
            </div>
            <div className={classes["doctor-name"]}>
              <p>의사: {props.doctorName}</p>
            </div>
          </div>
        </Link>
      </div>

      <div className={classes["text"]}>
        <p>
          {isViewMore ? contents : contents.slice(0, 200)}
          <span className={classes["view-more"]} onClick={() => setIsViewMore(!isViewMore)}>
            {" "}
            {isViewMore ? "접기" : contents.length > 200 && "... 더보기"}
          </span>
        </p>
      </div>

      <div className={classes["price"]}>
        <p>{treatmentName}</p>
        <p>{treatmentPrice.toLocaleString("en-US")}원</p>
      </div>
    </div>
  );
};

export default ReviewContent;
