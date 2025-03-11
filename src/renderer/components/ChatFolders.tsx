import {
  Accordion,
  AccordionToggleEventHandler,
} from '@fluentui/react-components';
import { IChat } from 'intellichat/types';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import useChatStore from 'stores/useChatStore';
import ChatFolder from './ChatFolder';
import { tempChatId } from 'consts';

export default function ChatFolders({
  chats,
  collapsed,
}: {
  chats: IChat[];
  collapsed: boolean;
}) {
  const chat = useChatStore((state) => state.chat);
  const folder = useChatStore((state) => state.folder);
  const folders = useChatStore((state) => state.folders);
  const openFolders = useChatStore((state) => state.openFolders);
  const tempStage = useChatStore((state) => state.tempStage);
  const { initChat, selectFolder, getCurFolderSettings, setOpenFolders } =
    useChatStore();
  const clickCountRef = useRef(0);

  const chatsGroupByFolder = useMemo(() => {
    const groups = chats.reduce(
      (acc, chat) => {
        const folderId = chat.folderId as string;
        if (!acc[folderId]) {
          acc[folderId] = [];
        }
        acc[folderId].push(chat);
        return acc;
      },
      {} as Record<string, IChat[]>,
    );
    return groups;
  }, [chats]);

  const handleToggle = useCallback<AccordionToggleEventHandler>(
    (_, data) => {
      clickCountRef.current += 1;
      if (clickCountRef.current % 2 === 0) {
        clickCountRef.current = 0;
        return;
      }

      const timer = setTimeout(() => {
        if (clickCountRef.current % 2 !== 0) {
          selectFolder(data.value as string);
          setOpenFolders(data.openItems as string[]);
        }
        clickCountRef.current = 0;
      }, 200);

      return () => clearTimeout(timer);
    },
    [chat.id],
  );

  useEffect(() => {
    if (folder && chat.id === tempChatId) {
      initChat(getCurFolderSettings());
    }
  }, [folder]);

  return (
    <Accordion
      multiple
      collapsible
      onToggle={handleToggle}
      openItems={openFolders}
    >
      {Object.keys(folders)
        .sort()
        .map((folderId) => {
          const folder = folders[folderId];
          const chatsInFolder = chatsGroupByFolder[folderId];
          return (
            <ChatFolder
              key={folderId}
              chats={chatsInFolder || []}
              collapsed={collapsed}
              folder={folder}
            />
          );
        })}
    </Accordion>
  );
}
