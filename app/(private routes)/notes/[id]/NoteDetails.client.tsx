import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api/serverApi"; // Припускаємо, що це API для сервера
import NoteDetailsClient from "./NoteDetails.client";
import { Metadata } from "next";

type Props = {
  params: { id: string };
};

// 💡 Примітка: Я прибрав 'Promise<...>' з типу Props, оскільки в App Router 'params' вже є об'єктом.
// Якщо ви отримуєте 'undefined' у generateMetadata, то проблема, ймовірно, у вашому fetchNoteById(id).
// Я також прибрав 'await' перед 'params', оскільки він вже деструктурується.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params
  
  // 🛑 Важлива перевірка для generateMetadata
  if (!id) {
    return { title: 'Note Not Found' };
  }
  
  try {
    const note = await fetchNoteById(id)
    return {
      title: `Note: ${note.title}`,
      description: note.content.slice(0, 30),
      openGraph: {
        title: `Note: ${note.title}`,
        description: note.content.slice(0, 30),
        url: `https://08-zustand-ten-mu.vercel.app/${id}`,
        images: [
          {
            url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
            width: 1200,
            height: 630,
            alt: "Note Hub Foto",
          },
        ],
      },
    }
  } catch (error) {
     return { title: 'Note Not Found' };
  }
}

export default async function NoteDetails({ params }: Props) {
  const { id } = params;
  const queryClient = new QueryClient();

  // 🛑 Запобігання префетчингу з undefined ID
  if (!id) {
    // Тут можна рендерити сторінку помилки або порожній вміст
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Invalid Note ID provided.
      </div>
    );
  }

  // Префетчинг даних на сервері
  await queryClient.prefetchQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
};
