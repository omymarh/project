<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Elastic\Elasticsearch\ClientBuilder;

class TaskSearchController extends Controller
{
    public function search(Request $request)
    {
        $searchTerm = $request->input('q'); // "q" sera le texte recherché
        
        $client = ClientBuilder::create()
            ->setHosts(['localhost:9200']) // ou ['elasticsearch:9200'] si tu es dans Docker Sail
            ->build();

        $params = [
            'index' => 'tasks',
            'body'  => [
                'query' => [
                    'multi_match' => [
                        'query'  => $searchTerm,
                        'fields' => ['title', 'description'],
                    ]
                ]
            ]
        ];

        $response = $client->search($params);

        // Retourne les résultats au format JSON
        return response()->json($response['hits']['hits']);
    }
}