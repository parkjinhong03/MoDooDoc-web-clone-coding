import classNames from "classnames";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useState, useEffect, useCallback, useMemo } from "react";
import Hospital from "../../models/hospital.model";
import classes from "./ReviewFilter.module.scss";

const ReviewFilter: React.FC<{
  treatmentPricesCountPerName: Hospital["treatmentPricesCountPerName"];
}> = ({ treatmentPricesCountPerName }) => {
  const router = useRouter();
  const [path, paramsStr] = router.asPath.split("?");
  const params = new URLSearchParams(paramsStr);
  const currentSearchQuery = params.get("q");

  const treatmentPriceNames = useMemo(
    () => treatmentPricesCountPerName.map(({ name }) => name),
    [treatmentPricesCountPerName]
  );
  const [isSearching, setIsSearching] = useState(() => {
    // 링크 타고 들어왔거나 리프레쉬한 경우 isSearching가 설정 안되어있으니 설정 코드 추가
    return !!(currentSearchQuery && !treatmentPriceNames.includes(currentSearchQuery));
  });

  const filterAllReviewsBtnClickHandler = () => {
    if (isSearching || currentSearchQuery) {
      setIsSearching(false);
      // setSearchQuery("");
      params.delete("q");
      router.replace(`${path}?${params.toString()}`);
    }
  };

  const openSearchBarBtnClickHandler = () => {
    setIsSearching(!isSearching);
  };

  const filterTreatmentReviewsBtnClickHandler = (name: string) => {
    if (isSearching || currentSearchQuery !== name) {
      setIsSearching(false);
      // setSearchQuery("");
      params.set("q", name);
      router.replace(`${path}?${params.toString()}`);
    }
  };

  const reviewSearchBarSubmitHandler = (searchQuery: string) => {
    if (searchQuery && searchQuery !== currentSearchQuery) {
      params.set("q", searchQuery);
      router.replace(`${path}?${params.toString()}`);
    }
  };

  const reviewSearchBarSearchQueryInitializer = useCallback(() => {
    if (currentSearchQuery && !treatmentPriceNames.includes(currentSearchQuery)) {
      return currentSearchQuery;
    } else {
      return "";
    }
  }, [currentSearchQuery, treatmentPriceNames]);

  return (
    <div className={classes["review-filter"]}>
      <div className={classes["btn-list"]}>
        <ReviewFilterBtn isSelected={!isSearching && !currentSearchQuery} onClick={filterAllReviewsBtnClickHandler}>
          <p>전체</p>
        </ReviewFilterBtn>

        <ReviewFilterBtn isSelected={isSearching} onClick={openSearchBarBtnClickHandler}>
          <Image src="/img/search_icon_inactive.svg" alt="search_icon_inactive" width={11} height={11} />
          <p>검색</p>
        </ReviewFilterBtn>

        {treatmentPricesCountPerName.map(({ name, count }) => (
          <ReviewFilterBtn
            key={name}
            isSelected={!isSearching && currentSearchQuery === name}
            onClick={() => {
              filterTreatmentReviewsBtnClickHandler(name);
            }}
          >
            <p>{name}</p>
            <p>{count}</p>
          </ReviewFilterBtn>
        ))}
      </div>

      {isSearching && (
        <ReviewSearchBar
          onSubmit={reviewSearchBarSubmitHandler}
          searchQueryInitializer={reviewSearchBarSearchQueryInitializer}
        />
      )}
    </div>
  );
};

const ReviewFilterBtn: React.FC<
  PropsWithChildren<{
    isSelected?: boolean;
    onClick?: React.MouseEventHandler;
  }>
> = (props) => {
  return (
    <div
      className={classNames(classes["btn"], { [classes["selected"]]: props.isSelected || false })}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
};

const ReviewSearchBar: React.FC<{
  onSubmit: (searchQuery: string) => void;
  searchQueryInitializer?: () => string;
}> = ({ onSubmit, searchQueryInitializer }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // 컴포넌트 mount & unmount될 때 searchQuery 값 초기화
  useEffect(() => {
    if (searchQueryInitializer) {
      setSearchQuery(searchQueryInitializer());
    }

    return () => {
      setSearchQuery("");
    };
  }, [searchQueryInitializer]);

  const searchQueryInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const cancelIconClickHandler = () => setSearchQuery("");

  return (
    <div className={classes["search-input-container"]}>
      <input
        value={searchQuery}
        placeholder="검색하고 싶은 키워드를 입력해주세요."
        onChange={searchQueryInputHandler}
      />
      <Image
        src="/img/cancel_icon.svg"
        className={classes["cancel-icon"]}
        alt="cancel_icon"
        width={16}
        height={16}
        onClick={cancelIconClickHandler}
      />
      <Image
        src={searchQuery ? "/img/search_icon_active.svg" : "/img/search_icon_inactive.svg"}
        className={classes["search-icon"]}
        alt="search_icon_inactive"
        width={18}
        height={18}
        onClick={() => {
          onSubmit(searchQuery);
        }}
      />
    </div>
  );
};

export default ReviewFilter;
