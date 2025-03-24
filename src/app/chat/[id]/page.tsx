import { use } from 'react';
import ChatClient from './ChatClient';

interface PageProps {
  params: { id: string };
}

export default function ChatPage({ params }: PageProps) {
  return <ChatClient chatId={params.id} />;
} 