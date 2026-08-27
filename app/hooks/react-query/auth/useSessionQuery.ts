import { useQuery } from '@tanstack/react-query';

import type { TUserSession } from '~/types/models/auth';

type TData = {
  session: TUserSession;
};

type TSessionQueryOpts = Parameters<
  typeof useQuery<TData, Error, TData, string[]>
>[0];

export type TUseSessionQueryOpts = {
  retry?: TSessionQueryOpts['retry'];
  refetchInterval?: TSessionQueryOpts['refetchInterval'];
};

export default function useSessionQuery({
  queryOptions: { retry = false, ...restOpts },
}: Readonly<{
  queryOptions: TUseSessionQueryOpts & {
    queryFn: Exclude<TSessionQueryOpts['queryFn'], undefined>;
  };
}>) {
  const queried = useQuery({
    ...restOpts,
    queryKey: ['session'],
    retry,
  });

  return queried;
}
