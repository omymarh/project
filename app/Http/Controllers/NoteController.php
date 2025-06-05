<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NoteController extends Controller
{
    // Affiche la page de création d'une note (formulaire avec éditeur Markdown)
    public function create()
    {
        // Le nom "CreateNotePage" doit correspondre à ton fichier React js/Pages/CreateNotePage.tsx
        return Inertia::render('CreateNotePage');
    }

    // Enregistre une nouvelle note
    public function store(Request $request)
    {
        // Validation basique, adapte selon tes besoins
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        // Création de la note (adapte selon ton modèle et logique)
        $note = \App\Models\Note::create([
            'content' => $validated['content'],
            'user_id' => auth()->id(), // Si tu gères les utilisateurs
        ]);

        // Redirection avec succès
        return redirect()->route('notes.show', $note->id)->with('success', 'Note créée avec succès !');
    }

    // Affiche une note
    public function show($id)
    {
        $note = \App\Models\Note::findOrFail($id);
        return Inertia::render('NoteShowPage', [
            'note' => $note,
        ]);
    }
}