import { useState } from "react";
import ReactDOM from "react-dom";

import classes from "./CleanSystemDescription.module.scss";
import CleanSystemModal from "./CleanSystemModal";

const CleanSystemDescription = () => {
  const [isOpenCleanSystemModal, setIsOpenCleanSystemModal] = useState(false);

  function openModalHandler() {
    setIsOpenCleanSystemModal(true);
  }

  function closeModalHandler() {
    setIsOpenCleanSystemModal(false);
  }

  return (
    <div className={classes["clean-system-description"]}>
      <div className={classes["description-pharse"]}>
        <p>
          <span className={classes["highlight"]}>영수증 인증</span> 리뷰는
        </p>
        <p> 클린 시스템을 통해 방문이 인증된 후기입니다. </p>
      </div>
      <div className={classes["show-modal-btn"]}>
        <p onClick={openModalHandler}>클린 시스템 보기</p>
      </div>

      {isOpenCleanSystemModal &&
        ReactDOM.createPortal(
          <CleanSystemModal onCloseModal={closeModalHandler} />,
          document.getElementById("clean-system-modal-portal")!
        )}
    </div>
  );
};

export default CleanSystemDescription;
