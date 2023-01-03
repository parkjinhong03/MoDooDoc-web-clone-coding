import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import classes from "./Header.module.scss";

const Header: React.FC<{
  title: string;
  showBackwardBtn: boolean;
}> = (props) => {
  const router = useRouter();

  return (
    <div className={classes["header"]}>
      {props.showBackwardBtn && (
        <div onClick={() => router.back()} className={classes["header-backward-btn"]}>
          <Image src="/img/backward.svg" alt="뒤로가기" width={23} height={18} />
        </div>
      )}
      <p className={classes["header-title"]}>{props.title}</p>
    </div>
  );
};

export default Header;
