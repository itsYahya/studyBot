'use client';
import {
  IconBrandTelegram,
  IconFileWord,
  IconPdf,
  IconTxt,
  IconLayoutSidebarRightCollapseFilled,
  IconLayoutSidebarLeftCollapseFilled,
  IconMoodEmpty,
} from '@tabler/icons-react';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

type ConversationType = {
  message: string;
  right: boolean; // for set every message in different side (if you need to use another variable check like "assistent" or "user")
};

export default function Home() {
  const [filesArray, setFilesArray] = useState<File[]>([]);
  const [conversation, setConversation] = useState<ConversationType[]>([]);
  const [message, setMessage] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const addNewFile = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    setFilesArray((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const sendMessage = () => {
    if (message) {
      setConversation((prev) => [...prev, { message: message, right: false }]);
      setConversation((prev) => [...prev, { message: 'hello', right: true }]); // just for test (use AI response)
    }
    setMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [conversation]);

  return (
    <div className="w-screen h-[100dvh] flex flex-row relative bg-[#E1E2E1] overflow-hidden">
      <section className="lg:w-[70%] md:w-[50%] flex flex-col h-full w-full">
        <section className=" md:hidden justify-end items-center pr-2 h-10  w-full pt-2 flex">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md flex justify-center w-8 h-8 cursor-pointer items-center bg-[#34495E] text-[#FF3C2F]"
          >
            <IconLayoutSidebarLeftCollapseFilled />
          </button>
        </section>
        <div ref={chatContainerRef} className="w-full h-[80%] py-5 md:px-14 px-5 overflow-auto scroll-smooth">
          {conversation.length > 0 ? (
            conversation.map((message, index) => (
              <div key={index} className={`chat ${message.right ? 'chat-start' : 'chat-end'}`}>
                <div
                  className={`chat-bubble shadow-lg break-all ${
                    message.right ? 'bg-[#34495E] text-white' : 'bg-white text-black'
                  }`}
                >
                  {message.message}
                </div>
              </div>
            ))
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <IconMoodEmpty className="w-32 h-32 text-[#34495E]/50" />
            </div>
          )}
        </div>
        <div className="w-full flex-grow flex justify-center items-center">
          <div className="rounded-xl h-[70%] w-[90%] gap-2 bg-[#34495E]/30 overflow-hidden flex flex-row">
            <textarea
              value={message}
              onKeyDown={(event) => handleKeyDown(event)}
              onChange={(event) => handleChange(event)}
              placeholder="Start chat with StudyBot"
              className="outline-none text-black w-full h-full p-2 px-4 resize-none "
            />
            <div className="h-full flex justify-center items-end">
              <button
                onClick={() => sendMessage()}
                className="flex jusitify-center items-center w-10 h-10 p-1 cursor-pointer"
              >
                <IconBrandTelegram className="w-7 h-7 text-[#FF3C2F]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`flex flex-col h-full lg:w-[30%] md:w-[50%] w-[90%] transition-all duration-1000 md:relative right-0 bg-[#E1E2E1] md:shadow-none shadow-xl absolute overflow-hidden  ${
          open ? 'translate-x-0' : 'md:translate-x-0 translate-x-[100%]'
        }`}
      >
        <section className="w-full h-[5%] md:hidden  justify-start items-end pl-2 flex">
          <button
            onClick={() => setOpen(false)}
            className="rounded-md flex justify-center w-8 h-8 cursor-pointer items-center bg-[#34495E] text-[#FF3C2F]"
          >
            <IconLayoutSidebarRightCollapseFilled />
          </button>
        </section>
        <section className={`flex w-full flex-col items-center flex-grow h-[95%]`}>
          <div className="flex flex-col w-full h-[90%] md:gap-4 gap-2 md:p-4 p-2 items-center overflow-auto">
            {filesArray.length > 0 ? (
              filesArray.map((file, index) => (
                <div
                  key={index}
                  className="md:w-[70%] w-[90%] gap-1 h-20 min-h-20 shadow-md p-2 flex items-center rounded-xl bg-[#34495E]/10"
                >
                  <div className="h-full bg-[#34495E] text-white aspect-square flex justify-center items-center rounded-xl">
                    {file.name.split('.').pop()?.toLowerCase() === 'pdf' ? (
                      <IconPdf className="w-8 h-8" />
                    ) : file.name.split('.').pop()?.toLowerCase() === 'txt' ? (
                      <IconTxt className="w-8 h-8" />
                    ) : (
                      <IconFileWord className="w-8 h-8" />
                    )}
                  </div>
                  <h1 className="text-black font-semibold truncate">{file.name}</h1>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex justify-center items-center">
                <IconMoodEmpty className="w-32 h-32 text-[#34495E]/50" />
              </div>
            )}
          </div>
          <div className="h-[10%] w-[90%] flex justify-center items-center">
            <input
              onChange={(e) => handleFileChange(e)}
              ref={fileRef}
              type="file"
              accept=".txt, .pdf, .doc, .docx"
              className="hidden"
            />
            <button
              onClick={() => addNewFile()}
              className="md:w-[70%] w-full rounded-xl cursor-pointer bg-[#FF3C2F] h-10 flex justify-center items-center"
            >
              Add new File
            </button>
          </div>
        </section>
      </section>
    </div>
  );
}
