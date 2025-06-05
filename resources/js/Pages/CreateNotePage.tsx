import React from "react";
import NoteEditor from "@/js/Components/NoteEditor";

export default function CreateNotePage() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Créer une nouvelle note</h2>
      <NoteEditor />
    </div>
  );
}