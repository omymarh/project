import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { router } from "@inertiajs/react";

interface NoteEditorProps {
  initialContent?: string;
  noteId?: number;
  onSaved?: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialContent = "", noteId, onSaved }) => {
  const [value, setValue] = useState(initialContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteId) {
      // Edition
      router.post(`/notes/${noteId}/update`, { content: value }, { onSuccess: onSaved });
    } else {
      // Nouvelle note
      router.post("/notes", { content: value }, { onSuccess: onSaved });
    }
  };

  return (
    <form onSubmit={handleSubmit} data-color-mode="light">
      <MDEditor value={value} onChange={setValue} />
      <button type="submit" className="btn btn-primary mt-2">Enregistrer</button>
    </form>
  );
};

export default NoteEditor;