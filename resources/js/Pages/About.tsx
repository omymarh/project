import React from "react";

export default function About() {
  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-4">À propos du Kanbanboard</h1>
      <ul className="list-disc list-inside space-y-2 text-lg">
        <li>📚 <strong>Centraliser la documentation</strong> : processus, FAQ, bonnes pratiques</li>
        <li>🔎 <strong>Faciliter la recherche d’informations</strong> avec Elasticsearch</li>
        <li>🗂️ <strong>Gérer les tâches via un Kanban interactif</strong></li>
        <li>🧩 <strong>Apporter une solution modulable et évolutive</strong></li>
      </ul>
      <div className="mt-6 text-gray-700">
        Cette application vise à fournir un espace de travail collaboratif, efficace et facile à faire évoluer selon vos besoins.
      </div>
    </div>
  );
}