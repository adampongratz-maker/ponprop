-- Todos table — rich property-management to-do list
CREATE TABLE public.todos (
  id            UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  description   TEXT,
  priority      TEXT        NOT NULL DEFAULT 'medium'
                  CHECK (priority IN ('low', 'medium', 'high')),
  status        TEXT        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date      DATE,
  property_id   UUID,
  category      TEXT
                  CHECK (category IS NULL OR category IN ('maintenance', 'tenant', 'financial', 'legal', 'general')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own todos" ON public.todos
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
