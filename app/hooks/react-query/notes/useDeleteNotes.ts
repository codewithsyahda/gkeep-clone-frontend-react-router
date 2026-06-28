import { useMutation } from '@tanstack/react-query';

import axiosInstance from '~/lib/http';

const useDeleteNotes = () => {
  const mutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete('/notes', {
        withCredentials: true,
      });

      return null;
    },
  });

  return mutation;
};

export default useDeleteNotes;
