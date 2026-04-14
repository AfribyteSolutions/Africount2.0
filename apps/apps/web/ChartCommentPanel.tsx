import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Send, Trash2, Edit2, Smile } from "lucide-react";

interface ChartCommentPanelProps {
  chartId: string;
  workspaceId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ChartCommentPanel: React.FC<ChartCommentPanelProps> = ({
  chartId,
  workspaceId,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  // Fetch comments
  const { data: comments, isLoading, refetch } = trpc.comment.getChartComments.useQuery(
    {
      chartId,
      workspaceId,
      limit: 50,
      offset: 0,
    },
    { enabled: isOpen }
  );

  // Fetch reactions for each comment
  const { data: reactionsMap } = trpc.comment.getReactions.useQuery(
    { commentId: comments?.[0]?.id || 0, workspaceId },
    { enabled: isOpen && (comments?.length || 0) > 0 }
  );

  // Create comment mutation
  const createMutation = trpc.comment.createChartComment.useMutation({
    onSuccess: () => {
      setContent("");
      refetch();
    },
  });

  // Update comment mutation
  const updateMutation = trpc.comment.updateChartComment.useMutation({
    onSuccess: () => {
      setEditingId(null);
      setEditContent("");
      refetch();
    },
  });

  // Delete comment mutation
  const deleteMutation = trpc.comment.deleteChartComment.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Add reaction mutation
  const addReactionMutation = trpc.comment.addReaction.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Remove reaction mutation
  const removeReactionMutation = trpc.comment.removeReaction.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleAddComment = () => {
    if (!content.trim() || !user) return;

    createMutation.mutate({
      chartId,
      workspaceId,
      content: content.trim(),
    });
  };

  const handleUpdateComment = (commentId: number) => {
    if (!editContent.trim()) return;

    updateMutation.mutate({
      commentId,
      workspaceId,
      content: editContent.trim(),
    });
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteMutation.mutate({
        commentId,
        workspaceId,
      });
    }
  };

  const handleAddReaction = (commentId: number, reactionType: string) => {
    addReactionMutation.mutate({
      commentId,
      workspaceId,
      reactionType,
    });
  };

  const handleRemoveReaction = (commentId: number, reactionType: string) => {
    removeReactionMutation.mutate({
      commentId,
      workspaceId,
      reactionType,
    });
  };

  if (!isOpen) return null;

  const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">Comments</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          ✕
        </Button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading comments...</div>
        ) : (comments?.length || 0) === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No comments yet. Start a discussion!
          </div>
        ) : (
          comments?.map((comment) => (
            <Card key={comment.id} className="p-3 space-y-2">
              {/* Comment Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {comment.userId === user?.id ? "You" : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {comment.userId === user?.id ? "You" : `User ${comment.userId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {comment.userId === user?.id && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Edit Mode */}
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Edit your comment..."
                    className="min-h-16 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateComment(comment.id)}
                      disabled={updateMutation.isPending}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Comment Content */}
                  <p className="text-sm text-foreground">{comment.content}</p>

                  {/* Reactions */}
                  <div className="flex flex-wrap gap-1 pt-2">
                    {reactionEmojis.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleAddReaction(comment.id, emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-20 text-sm resize-none"
        />
        <Button
          onClick={handleAddComment}
          disabled={!content.trim() || createMutation.isPending}
          className="w-full"
          size="sm"
        >
          <Send className="w-4 h-4 mr-2" />
          Post Comment
        </Button>
      </div>
    </div>
  );
};
