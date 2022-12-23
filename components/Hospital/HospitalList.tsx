import React from "react";
import Hospital from "../../models/hospital.model";
import HospitalCard from "./HospitalCard";

const HospitalList: React.FC<{
  hospitals: {
    id: Hospital["id"];
    name: Hospital["name"];
  }[];
}> = (props) => {
  return (
    <div>
      {props.hospitals.map((hospital) => (
        <HospitalCard key={hospital.id} hospital={hospital} />
      ))}
    </div>
  );
};

export default HospitalList;
