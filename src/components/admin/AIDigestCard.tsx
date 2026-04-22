"use client";

import { api } from "@/trpc/react";
import { ChatMessageSkeleton } from "@/components/shared/skeletons/ChatMessageSkeleton";

export function AIDigestCard() {
  const { data, isPending } = api.ai.getDailyDigest.useQuery();

  return (
    <div className="bg-[#171717] border border-[#1E1E1E] border-l-2 border-l-gold-warm p-6">
      <h3 className="text-ivory text-xs tracking-[0.14em] uppercase font-sans mb-4">
        AI Daily Digest
      </h3>
      {isPending ? (
        <div className="space-y-3">
          <ChatMessageSkeleton />
          <ChatMessageSkeleton />
          <ChatMessageSkeleton />
        </div>
      ) : (
        <p className="font-display text-parchment font-light text-base leading-relaxed">
          {data?.digest ?? "No digest available yet."}
        </p>
      )}
      {data?.generatedAt && (
        <p className="text-ash text-xs font-sans mt-4">
          Generated {new Date(data.generatedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
