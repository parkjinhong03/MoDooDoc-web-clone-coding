import Image from "next/image";
import React from "react";

import classes from "./StarRating.module.scss";

const StarRating: React.FC<{ score: number }> = (props) => {
  const roundedAverage = Math.round(props.score);
  const starImgSrcs = Array(Math.floor(roundedAverage / 2))
    .fill(2)
    .concat(roundedAverage % 2 === 0 ? [] : [roundedAverage % 2])
    .concat(Array(5 - Math.ceil(roundedAverage / 2)).fill(0))
    .map((e: number) => {
      return { 0: "/img/star_empty.svg", 1: "/img/star_half.svg", 2: "/img/star_full.svg" }[e] || "/img/star_empty.svg";
    });

  return (
    <div className={classes["star-rating"]}>
      {starImgSrcs.map((starImgSrc, index) => (
        <Image key={index} src={starImgSrc} alt="star" width={13} height={13} />
      ))}
    </div>
  );
};

export default StarRating;
