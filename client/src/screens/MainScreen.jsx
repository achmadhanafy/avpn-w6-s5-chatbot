import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { useChatbotMutation } from "../lib/services/chatApi";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessageInConversation,
  addNewConverstation,
  deleteConversation,
  setActiveConversationId,
  setTitleInConversation,
} from "../lib/slice/conversationSlice";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- START: Icon Components ---
const SendIcon = () => (
  <svg
    xmlns="http://www.w.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 640 640"
  >
    <path
      fill="white"
      d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"
    />
  </svg>
);
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const MessageSquareIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
// --- END: Icon Components ---

// --- START: Framer Motion Variants ---
const animation_config = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1], // A standard deceleration easing curve
};

const sidebarVariants = {
  open: { x: 0, transition: animation_config },
  closed: { x: "-100%", transition: animation_config },
};

const messageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};
// --- END: Framer Motion Variants ---

function App() {
  const [fetchRequest, result] = useChatbotMutation();
  const dispatch = useDispatch();
  const conversations = useSelector(
    (state) => state.conversation?.conversations
  );
  const activeConversationId = useSelector(
    (state) => state.conversation?.activeConversationId
  );

  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const chatEndRef = useRef(null);

  const activeConversation = conversations?.find(
    (c) => c.id === activeConversationId
  );

  // Effect to handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect to scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, result.isLoading]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (text === "" || !activeConversation) return;

    const newMessage = { role: "user", message: text };

    const conversationMessageById = conversations
      ?.find((item) => item?.id === activeConversationId)
      ?.messages?.filter(
        (item) => item.role !== "first" && item.role !== "error"
      );
    dispatch(
      addMessageInConversation({
        conversationId: activeConversationId,
        message: newMessage,
      })
    );
    setInputValue("");

    fetchRequest({
      conversation: [...conversationMessageById, newMessage],
      isNewSession: conversationMessageById.length === 0,
    })
      .unwrap()
      .then((res) => {
        const aiMessage = { role: "model", message: res?.data };
        console.log(res, "response disini");
        dispatch(
          addMessageInConversation({
            conversationId: activeConversationId,
            message: aiMessage,
          })
        );
        if (res?.sessionTitle) {
          dispatch(
            setTitleInConversation({
              conversationId: activeConversationId,
              title: res?.sessionTitle,
            })
          );
        }
      })
      .catch((err) => {
        const aiMessage = {
          role: "error",
          message: err?.data?.message,
        };

        dispatch(
          addMessageInConversation({
            conversationId: activeConversationId,
            message: aiMessage,
          })
        );
      });
  };

  const handleNewChat = () => {
    dispatch(addNewConverstation());
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const switchConversation = (id) => {
    dispatch(setActiveConversationId(id));
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white overflow-hidden font-sans">
      {/* --- START: Sidebar --- */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-lg p-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Sagara AI</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-full hover:bg-gray-700"
          >
            <XIcon />
          </button>
        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center justify-center w-full gap-2 px-4 py-2 mb-4 text-sm font-semibold bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon />
          New Chat
        </button>
        <div className="flex-1 overflow-y-auto -mr-4 pr-4 space-y-2">
          {conversations?.map((convo) => (
            <div
              key={convo.id}
              onClick={() => switchConversation(convo.id)}
              className={`group flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                activeConversationId === convo.id
                  ? "bg-gray-700"
                  : "hover:bg-gray-700/50"
              }`}
            >
              {/* 👇 text container must be flexible + shrinkable */}
              <div className="flex flex-row gap-3 flex-1 min-w-0">
                <MessageSquareIcon className="w-5 h-5 flex-shrink-0" />
                <p className="truncate text-sm font-medium">{convo?.title}</p>
              </div>

              {conversations?.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevents triggering switchConversation
                    dispatch(deleteConversation({ conversationId: convo.id }));
                  }}
                  className="hidden group-hover:block"
                >
                  <DeleteIcon />
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
      {/* --- END: Sidebar --- */}

      {/* --- START: Main Chat Area --- */}
      <motion.main
        className="flex-1 flex flex-col relative"
        animate={{ marginLeft: isSidebarOpen ? 260 : 0 }}
      >
        <header className="flex items-center p-4 border-b border-gray-700 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 mr-4 rounded-full hover:bg-gray-700"
          >
            <MenuIcon />
          </button>
          <h3 className="text-lg font-semibold">
            {activeConversation?.title || "Chat"}
          </h3>
        </header>

        <div className="flex-1 p-4 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {activeConversation?.messages?.map((msg, index) => (
              <motion.div
                layout
                key={index}
                className={`flex my-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
                variants={messageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl shadow-md ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-gray-700 text-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm text-left whitespace-pre-wrap">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.message}
                    </ReactMarkdown>
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {result.isLoading && (
            <motion.div
              className="flex justify-start my-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-gray-700 text-gray-200 rounded-2xl rounded-bl-none px-4 py-3 flex items-center space-x-2">
                <motion.span
                  className="w-2 h-2 bg-purple-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.span
                  className="w-2 h-2 bg-purple-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.8,
                    delay: 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.span
                  className="w-2 h-2 bg-purple-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.8,
                    delay: 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        <motion.div
          className="p-4 border-t border-gray-700 sticky bottom-0 bg-gray-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3"
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask something..."
              className="w-full text-sm bg-gray-700 text-white rounded-2xl py-6 px-5 resize-none max-h-32 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={1} // optional, starts with 1 row
            />
            <button
              type="submit"
              className="p-3 rounded-full text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
              disabled={!inputValue.trim()}
            >
              <SendIcon />
            </button>
          </form>
        </motion.div>
      </motion.main>
      {/* --- END: Main Chat Area --- */}
    </div>
  );
}

export default App;
