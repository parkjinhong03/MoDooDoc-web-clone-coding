import React from "react";
import classes from "./CleanSystemModal.module.scss";

const CleanSystemModal: React.FC<{
  onCloseModal: () => void;
}> = (props) => {
  function backgroundClickHandler(event: React.MouseEvent) {
    if (event.currentTarget === event.target) {
      props.onCloseModal();
    }
  }

  return (
    <div className={classes["clean-system-modal"]} onClick={backgroundClickHandler}>
      <div className={classes["modal-content"]}>
        <p>클린 시스템 보기 모달</p>
      </div>
    </div>
  );
};

export default CleanSystemModal;
