export type Todo = {
  id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
};

export type DiaryEntry = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};
