import Link from "next/link";
import React from "react";
import Hospital from "../../models/hospital.model";
import classes from "./HospitalCard.module.scss";

const HospitalCard: React.FC<{
  hospital: {
    id: Hospital["id"];
    name: Hospital["name"];
  };
}> = (props) => {
  return (
    <div className={classes["hospital-card"]}>
      <Link className={classes["hospital-card-name"]} href={`/hospitals/${props.hospital.id}/reviews`}>
        {props.hospital.name}
      </Link>
    </div>
  );
};

export default HospitalCard;
