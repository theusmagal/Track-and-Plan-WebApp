import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  cardId: number;
}

function CommentSection({ cardId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments/${cardId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ cardId, text: newComment }),
      });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const deleteComment = async (id: number) => {
    try {
      await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const updateComment = async (id: number, newText: string) => {
    try {
      await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text: newText }),
      });
      fetchComments();
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [cardId]);

  return (
    <div className="mt-2 text-sm">
      <h4 className="font-semibold mb-1">Comments</h4>

      {comments.map((comment) => (
        <div key={comment.id} className="border p-2 rounded mb-1 bg-gray-50">
          <div className="text-gray-700 whitespace-pre-wrap">{comment.text}</div>
          <div className="text-xs text-gray-500 mt-1 flex justify-between">
            <div>
              Created {formatDistanceToNow(new Date(comment.createdAt))} ago
              {comment.updatedAt !== comment.createdAt &&
                ` • Updated ${formatDistanceToNow(new Date(comment.updatedAt))} ago`}
            </div>
            <div className="space-x-1">
              <button
                onClick={() => {
                  const edited = prompt('Edit comment:', comment.text);
                  if (edited !== null) updateComment(comment.id, edited);
                }}
                className="text-blue-500 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => deleteComment(comment.id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow border rounded px-2 py-1 text-sm"
        />
        <span
          onClick={addComment}
          className="cursor-pointer text-blue-500 text-xl hover:text-blue-700 select-none"
          title="Add comment"
        >
          ＋
        </span>
      </div>
    </div>
  );
}

export default CommentSection;
