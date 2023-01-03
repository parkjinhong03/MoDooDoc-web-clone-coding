import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import React, { useState } from "react";
import { ReactQueryDevtools } from "react-query/devtools";
import { setDefaultQueryOptions_Cli, setDefaultQueryOptions_Serv } from "../hooks/http-api/query-keys";

// react-query 캐시들을 서버측에 저장해두기 위한 객체. getServerSideProps 등 서버에서 돌아가는 코드에서만 사용한다. (모든 유저와 공용되기 때문에 사용시 주의 필요)
// 참고로 nextjs는 클라이언트측 코드에서 사용하지 않는 번들은 클라이언트로 내보내지 않는다. (이건 컴포넌트 외부에서 선언되어있고, 서버측 코드에서만 사용되고 있음기 때문에 내보내지 않음)
export const serverSideQueryClient = (() => {
  const queryClient = new QueryClient();
  setDefaultQueryOptions_Serv(queryClient);
  return queryClient;
})();

export default function App({ Component, pageProps }: AppProps) {
  // react-query 캐시들을 클라이언트 측에 저장해두기 위한 객체. 각각의 유저의 클라이언트에 따로따로 저장되며 클라이언트에서 돌아가는 코드에서 사용한다.
  // 참고로 useState를 이용한 이유는 page 이동시 app 자체가 다시 재렌더링되는 구조이기 때문에 useState를 사용하지 않고 선언하면 페이지 이동할 때 마다 캐시가 날라감.
  const [clientSideQueryClient] = useState(() => {
    const queryClient = new QueryClient();
    setDefaultQueryOptions_Cli(queryClient);
    return queryClient;
  });

  return (
    <QueryClientProvider client={clientSideQueryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Component {...pageProps} />
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
