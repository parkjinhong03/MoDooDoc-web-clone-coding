import Image from "next/image";
import React, { useState } from "react";
import Review from "../../models/review.model";
import { formatToString } from "../../utils/date_format";
import classes from "./ReviewAuthor.module.scss";

const ReviewAuthor: React.FC<{
  id: Review["id"];
  customer: Review["customer"];
  hospitalId: Review["hospitalId"];
  registeredAt: Review["registeredAt"];
  likedCnt: Review["likedCnt"];
  alreadyLiked: Review["alreadyLiked"];
  viewIsUsefulBtn: boolean;
  isUsefulBtnOnClick?: (reviewId: number) => void;
}> = (props) => {
  // const [alreadyLiked, setAlreadyLiked] = useState(props.alreadyLiked);

  const parsedRegisteredAt = new Date(props.registeredAt);
  const formattedRegisteredAt = formatToString(parsedRegisteredAt);

  const isUsefulBtnClickHandler = () => {
    // setAlreadyLiked(!alreadyLiked);
    if (props.isUsefulBtnOnClick) {
      props.isUsefulBtnOnClick(props.id);
    }
  };

  return (
    <div className={classes["review-author"]}>
      <div className={classes["profile"]}>
        <div className={classes["image-container"]}>
          <Image src={props.customer.profileImage} alt="profile-image" width={16} height={16} unoptimized />
        </div>
        <div className={classes["user-inform-container"]}>
          <div className={classes["name"]}>
            <p>{props.customer.nickname}</p>
          </div>
          <div className={classes["cnt-and-registered-at"]}>
            <div className={classes["cnt"]}>
              <div className={classes["review-cnt"]}>
                <Image src="/img/pencil_gray.svg" alt="pencil_gray" width={13} height={13} />
                <p>{props.customer.reviewCnt}</p>
              </div>
              <div className={classes["liked-cnt"]}>
                <Image src="/img/heart_gray.svg" alt="heart_gray" width={13} height={13} />
                <p>{props.customer.likedCnt}</p>
              </div>
            </div>
            <div className={classes["divider"]} />
            <div className={classes["registered-at"]}>
              <p>{formattedRegisteredAt} 등록</p>
            </div>
          </div>
        </div>
      </div>

      {props.viewIsUsefulBtn && (
        <div className={classes["is-useful"]} onClick={isUsefulBtnClickHandler}>
          <p>도움됐어요</p>
          <Image
            src={props.alreadyLiked ? "/img/heart_yellow_fill.svg" : "/img/heart_yellow_blank.svg"}
            alt="heart_yellow_blank"
            width={16}
            height={16}
          />
          <p>{props.likedCnt}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewAuthor;
