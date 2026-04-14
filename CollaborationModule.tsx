import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Heart, Reply, MoreVertical } from "lucide-react";
import { toast } from "sonner";

interface CollaborationModuleProps {
  projectId: number;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: Comment[];
  isLiked: boolean;
}

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  target: string;
  timestamp: Date;
  details?: string;
}

export default function CollaborationModule({
  projectId,
}: CollaborationModuleProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"comments" | "activity">(
    "comments"
  );
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "John Doe",
      avatar: "J",
      content: "Great work on the balance sheet calculations!",
      timestamp: new Date(Date.now() - 3600000),
      likes: 2,
      replies: [],
      isLiked: false,
    },
    {
      id: 2,
      author: "Jane Smith",
      avatar: "S",
      content: "I noticed a discrepancy in the equity section. Let me review it.",
      timestamp: new Date(Date.now() - 1800000),
      likes: 1,
      replies: [],
      isLiked: false,
    },
  ]);

  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: 1,
      user: "John Doe",
      action: "created",
      target: "Balance Sheet Q1 2026",
      timestamp: new Date(Date.now() - 86400000),
      details: "Initial balance sheet setup",
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "updated",
      target: "Assets Section",
      timestamp: new Date(Date.now() - 43200000),
      details: "Added new asset entries",
    },
    {
      id: 3,
      user: "John Doe",
      action: "commented on",
      target: "Liabilities Section",
      timestamp: new Date(Date.now() - 21600000),
      details: "Needs review",
    },
    {
      id: 4,
      user: "Jane Smith",
      action: "exported",
      target: "Balance Sheet Q1 2026",
      timestamp: new Date(Date.now() - 3600000),
      details: "CSV format",
    },
  ]);

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    const comment: Comment = {
      id: comments.length + 1,
      author: user?.name || "Unknown",
      avatar: user?.name?.charAt(0).toUpperCase() || "U",
      content: newComment,
      timestamp: new Date(),
      likes: 0,
      replies: [],
      isLiked: false,
    };

    setComments([...comments, comment]);
    setNewComment("");
    toast.success("Comment posted successfully");
  };

  const handleLikeComment = (id: number) => {
    setComments(
      comments.map((c) =>
        c.id === id
          ? {
              ...c,
              likes: c.isLiked ? c.likes - 1 : c.likes + 1,
              isLiked: !c.isLiked,
            }
          : c
      )
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Collaboration</h2>
        <p className="text-muted-foreground mt-1">
          Comments, activity feed, and team coordination
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("comments")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "comments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Comments
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "activity"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Activity Feed
        </button>
      </div>

      {/* Comments Tab */}
      {activeTab === "comments" && (
        <div className="space-y-6">
          {/* New Comment Form */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  className="africount-input min-h-24 resize-none"
                  placeholder="Share your thoughts or feedback..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => setNewComment("")}
                    disabled={!newComment.trim()}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-card rounded-lg border border-border p-4"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">
                          {comment.author}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(comment.timestamp)}
                        </div>
                      </div>
                      <button className="p-1 hover:bg-muted rounded">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                    <p className="text-foreground mt-2">{comment.content}</p>
                    <div className="flex gap-4 mt-3">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            comment.isLiked ? "fill-current text-primary" : ""
                          }`}
                        />
                        {comment.likes > 0 && comment.likes}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Reply className="w-4 h-4" />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="space-y-3">
          {activityLogs.map((log) => (
            <div
              key={log.id}
              className="bg-card rounded-lg border border-border p-4 flex gap-4"
            >
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                {log.user.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-foreground">
                      <span className="font-semibold">{log.user}</span>
                      {" " + log.action + " "}
                      <span className="font-semibold text-primary">
                        {log.target}
                      </span>
                    </p>
                    {log.details && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.details}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTime(log.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
