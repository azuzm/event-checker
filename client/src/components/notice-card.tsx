import { formatDistanceToNow } from "date-fns";
import type { NoticeResponse } from "@shared/schema";
import { MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoticeCardProps {
  notice: NoticeResponse;
}

export function NoticeCard({ notice }: NoticeCardProps) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:border-primary/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-primary font-bold">
            {notice.author?.avatarUrl ? (
              <img src={notice.author.avatarUrl} alt={notice.author.displayName} className="w-full h-full object-cover" />
            ) : (
              notice.author?.displayName?.charAt(0) || "?"
            )}
          </div>
          <div>
            <div className="font-semibold text-foreground">{notice.author?.displayName || "Anonymous"}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{formatDistanceToNow(new Date(notice.createdAt!), { addSuffix: true })}</span>
              <span>•</span>
              <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {notice.category}
              </span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground -mr-2">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
      
      <p className="text-foreground/80 leading-relaxed mb-4">
        {notice.content}
      </p>
      
      {notice.location && (
        <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm text-muted-foreground mb-4 inline-flex items-center gap-2">
          📍 {notice.location}
        </div>
      )}
      
      <div className="flex items-center gap-4 pt-4 border-t border-border/50">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          <MessageSquare className="w-4 h-4 mr-2" />
          Comment
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
}
