import React from "react";
import { dehydrate } from "react-query";
import HospitalList from "../components/Hospital/HospitalList";
import Header from "../components/Layout/Header";
import { prefetchHospitals, useFetchHospitals } from "../hooks/http-api/fetch-hospitals.hooks";
import { serverSideQueryClient } from "./_app";

// serverSideQueryClient + getServerSideProps 조합을 이용하여, 특정 주기마다 업데이트되는 캐싱된 SSR Props 구현 가능.
// (getStaticProps를 이용해도 가능하긴 하지만, revalidate 또한 설정을 해줘야하니 설정이 중복되는 느낌. 그리고 어차피 staleTime 차니까 굳이 빌드할 때 fetch해올 필요 X)
export async function getServerSideProps() {
  await prefetchHospitals(serverSideQueryClient);

  return {
    props: {
      dehydratedState: dehydrate(serverSideQueryClient),
    },
  };
}

export default function HospitalListPage() {
  const hospitals = useFetchHospitals();

  return (
    <React.Fragment>
      <Header title={"모두닥"} showBackwardBtn={false} />
      {!hospitals && <p>loading...</p>}
      {hospitals && <HospitalList hospitals={hospitals} />}
    </React.Fragment>
  );
}
