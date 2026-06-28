import { useMutation } from '@tanstack/react-query';

import axiosInstance from '~/lib/http';

const useDeleteNoteById = () => {
  const mutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (noteId.trim() === '')
        throw new Error('Note ID must be valid and non empty string value');

      await axiosInstance.delete(`/notes/${encodeURIComponent(noteId)}`, {
        withCredentials: true,
      });

      return null;
    },
  });

  return mutation;
};

export default useDeleteNoteById;
