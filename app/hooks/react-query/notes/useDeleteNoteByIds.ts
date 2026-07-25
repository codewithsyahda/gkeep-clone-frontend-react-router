import { useMutation } from '@tanstack/react-query';

import axiosInstance from '~/lib/http';

const useDeleteNoteByIds = () => {
  const mutation = useMutation({
    mutationFn: async (noteIds: string[]) => {
      await Promise.all(
        noteIds.map((n) =>
          axiosInstance.delete(`/notes/${encodeURIComponent(n)}`, {
            withCredentials: true,
          }),
        ),
      );

      return null;
    },
  });

  return mutation;
};

export default useDeleteNoteByIds;
