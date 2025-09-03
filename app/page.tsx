
"use client";

import { ListwisePageClient } from "@/components/listwise/page-client";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
  }

  // AuthProvider handles redirect, so we just need to ensure user is loaded.
  // The actual data loading will be inside ListwisePageClient
  if (!user) {
    return null; 
  }
  
  return (
      <ListwisePageClient />
  );
}
