'use client';
import {
  IconBrandTelegram,
  IconFileWord,
  IconPdf,
  IconTxt,
  IconLayoutSidebarRightCollapseFilled,
  IconLayoutSidebarLeftCollapseFilled,
  IconMoodEmpty,
  IconFileInfo,
  IconTemperature,
} from '@tabler/icons-react';
import axios from 'axios';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

type ConversationType = {
  message: string;
  right: boolean; // for set every message in different side (if you need to use another variable check like "assistent" or "user")
  date: string;
  id: string;
};

type FileResponseType = {
  filename: string;
  checksum: string;
  file_type: string;
};

export default function Home() {
  const [filesArray, setFilesArray] = useState<string[]>([]);
  const [conversation, setConversation] = useState<ConversationType[]>([]);
  const [message, setMessage] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [fileLoader, setFileLoader] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const addNewFile = () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const formData = new FormData();
    formData.append('file', file);
    setFileLoader(true);

    try {
      const response = await axios.post('http://localhost:8000/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 99999999,
      });

      if (response.data.chunks != undefined) {
        setFilesArray((prev) => [...prev, response.data.filename]);
      }
      setFileLoader(false);
    } catch (error) {
      console.error('Upload failed:', error);
    }
    e.target.value = '';
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const sendMessage = async () => {
    setLoading(true);
    if (message) {
      setConversation((prev) => [...prev, { message: message, right: false, id: "", date: "" }]);
    }
    setMessage('');
    //await new Promise((r) => setTimeout(r, 2000));
    const payload = {
      question: message,
      checksum: "ee728f9144da5610925b9f0e876e56925f448619d667612b25b70b13bb47afcd"
    };
    const res = await axios.post('http://localhost:8000/ask/', payload, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 99999999 
      });
    setConversation((prev) => [...prev, { message: res.data.answer, right: true, id: "", date: "" }]); // just for test (use AI response)
    console.log(res.data)
    setLoading(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const closeFileSummary = () => {
    modalRef.current?.close();
  };

  const handleFileSummary = () => {
    modalRef.current?.showModal();
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [conversation]);

  const getFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/files');
      //console.log(response.data)
      const filenames = response.data.map((item: FileResponseType) => item.filename);
      setFilesArray([...filenames]);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const getChatHistory = async () => {
    try {
      const payload = {
        "page": 1,
        "limit": 20
      };

      const response = await axios.post('http://localhost:8000/chat_history/', payload, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 99999999,
      });
      var res: ConversationType[] = Object.values(response.data.items)
      const flipped: ConversationType[] = res.reverse()
      setConversation(flipped)
    } catch (error) {
      console.error('failed to get chat history:', error);
    }
  };

  useEffect(() => {
    getFiles();
    getChatHistory();
  }, []);

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
        <div
          ref={chatContainerRef}
          className="w-full h-[80%] py-5 md:px-14 px-5 overflow-auto scroll-smooth"
        >
          {conversation.length > 0 ? (
            conversation.map((message, index) =>
              !message.right ? (
                <div key={index} className={`chat ${message.right ? 'chat-start' : 'chat-end'}`}>
                  <div
                    className={`chat-bubble shadow-lg break-all ${
                      message.right ? 'bg-[#34495E] text-white' : 'bg-white text-black'
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              ) : (
                <div key={index} className={`chat ${message.right ? 'chat-start' : 'chat-end'}`}>
                  <div
                    className={`chat-bubble shadow-lg break-all ${
                      message.right ? 'bg-[#34495E] text-white' : 'bg-white text-black'
                    }`}
                  >
                    {loading && index === conversation.length - 1 ? (
                      <p className="loader"></p>
                    ) : (
                      message.message
                    )}
                  </div>
                </div>
              )
            )
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
          <div className="flex flex-col w-full h-[90%] gap-4 md:p-4 p-2 items-center overflow-auto">
            {filesArray.length > 0 ? (
              filesArray.map((file, index) => (
                <div
                  key={index}
                  className="md:w-[70%] w-[90%] relative gap-1 h-20 min-h-20 shadow-md p-2 flex items-center rounded-xl bg-[#34495E]/10"
                >
                  <div className="h-full bg-[#34495E] text-white aspect-square flex justify-center items-center rounded-xl">
                    {file.split('.').pop()?.toLowerCase() === 'pdf' ? (
                      <IconPdf className="w-8 h-8" />
                    ) : file.split('.').pop()?.toLowerCase() === 'txt' ? (
                      <IconTxt className="w-8 h-8" />
                    ) : (
                      <IconFileWord className="w-8 h-8" />
                    )}
                  </div>
                  <h1 className="text-black font-semibold truncate">{file}</h1>
                  <button
                    onClick={() => handleFileSummary()}
                    className="w-8 h-8 cursor-pointer -left-3 -bottom-3 flex justify-center items-center text-white bg-[#FF3C2F] rounded-full absolute"
                  >
                    <IconFileInfo />
                  </button>
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
              disabled={fileLoader}
              className="md:w-[70%] w-full rounded-xl cursor-pointer bg-[#FF3C2F] h-10 flex justify-center items-center"
            >
              {fileLoader ? <p className="spinner"></p> : 'Add new File'}
            </button>
          </div>
        </section>
      </section>
      <dialog ref={modalRef} className="modal">
        <div className="modal-box bg-[#E1E2E1]">
          <h3 onClick={() => closeFileSummary()} className="text-lg font-bold">
            Hello!
          </h3>
          <p className="py-4">Press ESC key or click the button below to close</p>
          <div className="modal-action"></div>
        </div>
      </dialog>
    </div>
  );
}
