import { useMutation } from '@tanstack/react-query';

import axiosInstance from '~/lib/http';

const useDeleteNoteByIds = () => {
  const mutation = useMutation({
    mutationFn: async (noteIds: string[]) => {
      try {
        await Promise.all(
          noteIds.map((n) =>
            axiosInstance.delete(`/notes/${encodeURIComponent(n)}`, {
              withCredentials: true,
            }),
          ),
        );

        return null;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        throw new Error('Failed to delete notes');
      }
    },
  });

  return mutation;
};

export default useDeleteNoteByIds;
