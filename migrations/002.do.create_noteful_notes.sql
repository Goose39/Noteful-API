CREATE TABLE noteful_notes (
  id uuid PRIMARY KEY NOT NULL,
  note_name TEXT NOT NULL,
  content TEXT,
  modified TIMESTAMP DEFAULT now() NOT NULL,
  folderId uuid REFERENCES noteful_folders(id) ON DELETE CASCADE NOT NULL
);