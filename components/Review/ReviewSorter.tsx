import Image from "next/image";
import classes from "./ReviewSorter.module.scss";

const ReviewSorter = () => {
  return (
    <div className={classes["review-sorter"]}>
      <div className={classes["review-sorter-modal-open-btn"]}>
        <Image src="/img/sorter.svg" alt="sorter" width={13} height={11} />
        <p>기본순</p>
      </div>

      <div className={classes["doctor-filter-modal-open-btn"]}>
        <p>의사 전체</p>
        <Image src="/img/arrow_down.svg" alt="arrow_down" width={11} height={6} />
      </div>
    </div>
  );
};

export default ReviewSorter;
