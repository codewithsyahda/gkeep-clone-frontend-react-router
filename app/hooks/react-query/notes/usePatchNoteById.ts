import { useMutation } from '@tanstack/react-query';

import axiosInstance from '~/lib/http';
import type { TSuccessResponse } from '~/types/http';
import type {
  TMutateNoteRequest,
  TNoteSimpleResponse,
} from '~/types/models/notes';

const usePatchNoteById = () => {
  const mutation = useMutation({
    mutationFn: async ({
      noteId,
      data,
    }: {
      noteId: string;
      data: Partial<TMutateNoteRequest>;
    }) => {
      if (noteId.trim() === '') {
        throw new Error('Note ID must be valid and non empty string value');
      }

      const titlePayload = data.title;
      const jsonContentPayload = data.jsonContent;
      const statusPayload = data.status;
      const isTrashedPayload = data.isTrashed;

      if (
        titlePayload === undefined &&
        jsonContentPayload === undefined &&
        statusPayload === undefined &&
        isTrashedPayload === undefined
      ) {
        throw new Error('Must define at least one payload field');
      }

      const response = await axiosInstance.patch(
        `/notes/${encodeURIComponent(noteId.trim())}`,
        {
          ...(titlePayload === undefined
            ? {}
            : {
                title: titlePayload,
              }),
          ...(jsonContentPayload === undefined
            ? {}
            : {
                jsonContent: jsonContentPayload,
              }),
          ...(statusPayload === undefined
            ? {}
            : {
                status: statusPayload,
              }),
          ...(isTrashedPayload === undefined
            ? {}
            : {
                isTrashed: isTrashedPayload,
              }),
        },
        { withCredentials: true },
      );

      return response.data as TSuccessResponse<{
        note: TNoteSimpleResponse;
      }>;
    },
  });

  return mutation;
};

export default usePatchNoteById;
