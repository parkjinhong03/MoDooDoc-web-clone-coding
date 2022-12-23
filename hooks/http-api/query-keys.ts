import { QueryClient } from "react-query";

export enum QueryType {
  Hospitals,
  Reviews,
}

export const QueryKeyManager = {
  [QueryType.Hospitals]: {
    keyPrefix: "hospitals",
    defaultOption: {
      serverSide: {
        // serverSideQueryClient의 staleTime는 첫 접속(or 리프레쉬)시 받을 데이터의 최신화를 위하여. clientSideQueryClient의 staleTime는 한 번 들어온 이후부터의 데이터 최신화를 위하여
        // 그렇게 최신화 시켜주고 싶으면 serverSideQueryClient staleTime 0으로 설정해주면 되지 않음? -> ㄴㄴ. ES 재색인이 1분마다 일어나기 때문에 매번 가져올 필요 없고 1분에 한 번만 refetch하면 됨.
        staleTime: 60 * 1000,

        // cacheTime이 N이면, prefetchQuery후 N초 이내에 실제 Query와 연결되지 않으면 해당 캐시가 사라진다. (prefetchQuery로 생성된 Query는 기본적으로 inactive 상태이기 때문)
        // 하지만 이 예제에서는 prefetchQuery는 ServerSideQueryClient에서, 그리고 useQuery는 ClientSideQueryClient에서 수행되므로 ServerSideQueryClient 입장에서는 사실 평생 연결되지 않는 것.
        // 그래서 cacheTime과 staleTime이 거의 시간이 동시에 돌기 때문에 cacheTime이 staleTime보다 작으면 staleTime이 다 차기 전에 cacheTime이 먼저 차서 refetch 된다.
        // 그렇다고 cacheTime을 staleTime보다 크게 잡을 필요 또한 딱히 없는게, prefetchQuery는 useQuery와는 다르게 stale된 cache를 사용하지 않음. 무조건 refetch 후 한 번에 반환하기 때문에.
        // 따라서 이 경우(서버사이드에서의 prefetch)는 staleTime과 cacheTime은 값이 같은게 가장 좋은듯?
        cacheTime: 60 * 1000,
      },
      clientSide: {
        // prefetchQuery와 동일하게 설정. 큰건 괜찮지만 작으면 안됨 (useQuery.staleTime 이상 prefetchQuery.staleTime 미만 사이의 시간동안은 첫 접속시 항상 refetch가 일어나기 때문)
        staleTime: 60 * 1000,

        // 여기서는 cacheTime은 기본값(5분) 사용. 굳이 줄일 필요 X.
        // 여기서도 cacheTime이 staleTime보다 커야 함. cacheTime < staleTime은 cacheTime = staleTime와 거의 비슷함. 캐시 없으면 stale 아니더라도 새로 fetch 해오기 때문 (prefetch처럼 완전 동일한건 아님. cacheTime 계산 방법이 다르기 때문에)
        // 애초에 staleTime는 '이 정도 지나면 refresh 한 번 해줘야 한다' 개념이고 cacheTime는 '이 정도로 안쓰이면 그 한 번을 위해 계속 저장해두고 있을 필요는 없다' 느낌이기 때문에 staleTime이 더 큰 게 이상
      },
    },
    createKey: () => [QueryKeyManager[QueryType.Hospitals].keyPrefix],
  },

  [QueryType.Reviews]: {
    keyPrefix: "reviews",
    defaultOption: {
      serverSide: {
        staleTime: 60 * 60 * 1000, // 요구사항 문서에 따르면, 리뷰 리스트는 주기적으로 한 번에 업데이트 되기 때문에 좀 더 길게 1시간으로 잡았음.
        cacheTime: 60 * 60 * 1000,
      },
      clientSide: {
        staleTime: 60 * 60 * 1000,
        cacheTime: 65 * 60 * 1000, // stale된 후 최소 5분은 계속 가지고 있도록 설정 (딱 5분도 아닌, 최대 5분도 아닌 최소 5분인거임.)
      },
    },
    createKey: (hospitalId: number, searchQuery?: string) => [
      QueryKeyManager[QueryType.Reviews].keyPrefix,
      hospitalId,
      {
        searchQuery: searchQuery || "",
      },
    ],
  },
};

export function setDefaultQueryOptions_Serv(queryClient: QueryClient) {
  Object.values(QueryKeyManager).forEach(({ keyPrefix, defaultOption }) => {
    // query option을 prefetchQuery나 useQuery에서 설정해주지 않는 이유는 https://github.com/TanStack/query/discussions/3220 때문에.
    // 첫 번째 요소에 keyPrefix가 설정되어있는 모든 key의 Query들은 아래 option을 그대로 가져감.
    queryClient.setQueryDefaults([keyPrefix], defaultOption.serverSide);
  });
}

export function setDefaultQueryOptions_Cli(queryClient: QueryClient) {
  Object.values(QueryKeyManager).forEach(({ keyPrefix, defaultOption }) => {
    queryClient.setQueryDefaults([keyPrefix], defaultOption.clientSide);
  });
}
