import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const firstId = uuidv4()

const conversationSlice = createSlice({
    name: "conversation",
    initialState: {
        conversations: [
            {
                id: firstId,
                title: "Introduction",
                messages: [
                    {
                        role: "first",
                        message: "Hello! I'm an Sagara Chatbot. How can I help you today?"
                    },
                ],
            },
        ],
        activeConversationId: firstId,
    },
    reducers: {
        addNewConverstation: (state, action) => {
            const newId = uuidv4();
            const newConversation = {
                id: newId,
                title: "Introduction",
                messages: [
                    {
                        role: "first",
                        message: "Hello! I'm an Sagara Chatbot. How can I help you today?"
                    },
                ],
            };
            state.conversations = [...state.conversations, newConversation];
            state.activeConversationId = newId;
        },
        addMessageInConversation: (state, action) => {
            const { conversationId, message } = action.payload;
            const conversationIndex = state.conversations.findIndex(
                (conversation) => conversation.id === conversationId
            );

            if (conversationIndex !== -1 && typeof conversationIndex === 'number') {
                state.conversations[conversationIndex].messages.push(message);
            }
        },
        setActiveConversationId: (state, action) => {
            state.activeConversationId = action.payload;
        },
        setTitleInConversation: (state, action) => {
            const { conversationId, title } = action.payload;
            const conversationIndex = state.conversations.findIndex(
                (conversation) => conversation.id === conversationId
            );

            if (conversationIndex !== -1 && typeof conversationIndex === 'number') {
                state.conversations[conversationIndex].title = title
            }
        },
        deleteConversation: (state, action) => {
            const { conversationId } = action.payload;
            state.conversations = state.conversations.filter(
                (conversation) => conversation.id !== conversationId
            );
            if(state.activeConversationId === conversationId){
                state.activeConversationId = state.conversations[0].id
            }
        }
    },
});

export const { addMessageInConversation, addNewConverstation, setActiveConversationId, setTitleInConversation, deleteConversation } = conversationSlice.actions;
export default conversationSlice