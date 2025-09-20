import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '/' }), // base url for Next.js API routes
  endpoints: (builder) => ({
    chatbot: builder.mutation({
      query: (body) => ({
        url: "/api/chat",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useChatbotMutation } = chatApi;
