"use client";

import { useEffect, useRef, useState } from "react";
import { useUpdateArticleProgress } from "@/hooks/use-education";

export function ReadingProgressBar({
  articleId,
  contentRef
}: {
  articleId: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [percent, setPercent] = useState(0);
  const lastSavedMilestone = useRef(0);
  const updateProgress = useUpdateArticleProgress(articleId);

  useEffect(() => {
    const handleScroll = () => {
      const node = contentRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalScrollable = rect.height - viewportHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(totalScrollable, 0));
      const nextPercent =
        totalScrollable > 0 ? Math.round((scrolled / totalScrollable) * 100) : 100;

      setPercent(nextPercent);

      const milestone = Math.floor(nextPercent / 25) * 25;
      if (milestone > lastSavedMilestone.current) {
        lastSavedMilestone.current = milestone;
        updateProgress.mutate(milestone);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  return (
    <div
      className="sticky top-16 z-10 h-1 w-full bg-surface-muted"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}
