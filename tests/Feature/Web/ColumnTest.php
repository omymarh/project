<?php

namespace Tests\Feature\Web;

use App\Models\Board;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ColumnTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Board $board;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();

        $this->user = User::whereEmail('test@example.com')->first();
        $this->board = $this->user->ownedBoards->first();
    }

    /**
     * Test la récupération d'une colonne.
     */
    public function test_get_one()
    {
        $response = $this
            ->actingAs($this->user)
            ->get(route('web.columns.show', $this->board->columns()->first()));

        $response
            ->assertOk()
            ->assertJsonStructure([
                'id',
                'name',
                'order',
                'color',
                'createdAt',
                'updatedAt',
            ]);
    }

    /**
     * Test la génération réussie de colonnes pour un nouveau tableau.
     */
    public function test_generate_success()
    {
        $freshBoard = Board::factory()->for($this->user, 'owner')->create();

        $response = $this
            ->actingAs($this->user)
            ->post(route('web.boards.columns.generate', $freshBoard->id));

        $response->assertRedirect();

        $this->assertEquals(4, $freshBoard->columns()->count());
    }

    /**
     * Test l'échec de la génération de colonnes pour un tableau existant.
     */
    public function test_generate_failed()
    {
        $response = $this
            ->actingAs($this->user)
            ->post(route('web.boards.columns.generate', $this->board->id));

        $response
            ->assertForbidden()
            ->assertJsonPath('message', 'The board already has columns');
    }

    /**
     * Test la création réussie d'une colonne par le propriétaire.
     */
    public function test_create_column_by_owner_should_success()
    {
        $requestBody = [
            'name' => 'Test Column',
            'order' => 0,
        ];

        $response = $this
            ->actingAs($this->user)
            ->post(route('web.boards.columns.store', $this->board->id), $requestBody);

        $response->assertRedirect();

        $this->assertDatabaseHas('columns', [
            'board_id' => $this->board->id,
            'name' => 'Test Column',
            'order' => 0,
        ]);
    }

    /**
     * Test la mise à jour réussie d'une colonne par le propriétaire.
     */
    public function test_update_column_by_owner_should_success()
    {
        $column = $this->board->columns()->first();
        $originalName = $column->name;

        $requestBody = [
            'name' => 'Updated Column',
            'color' => $column->color->value,
        ];

        $response = $this
            ->actingAs($this->user)
            ->patch(route('web.columns.update', $column->id), $requestBody);

        $response->assertRedirect();

        $this->assertDatabaseHas('columns', [
            'id' => $column->id,
            'name' => 'Updated Column',
            'color' => $column->color->value,
        ]);
        $this->assertDatabaseMissing('columns', [
            'id' => $column->id,
            'name' => $originalName,
        ]);
    }

    /**
     * Test la suppression réussie d'une colonne par le propriétaire.
     */
    public function test_delete_column_by_owner_should_success()
    {
        $column = $this->board->columns()->first();

        $response = $this
            ->actingAs($this->user)
            ->delete(route('web.columns.destroy', $column->id));

        $response->assertRedirect();

        $this->assertDatabaseMissing('columns', [
            'id' => $column->id,
        ]);
    }

    /**
     * Test la permutation réussie d'une colonne par le propriétaire.
     */
    public function test_swap_column_by_owner_should_success()
    {
        $targetColumn = $this->board->columns()->whereOrder(0)->first();
        $originalOrder = $targetColumn->order;

        $responseBody = [
            'order' => $targetColumn->order + 1,
        ];

        $response = $this
            ->actingAs($this->user)
            ->patch(route('web.columns.swap', $targetColumn->id), $responseBody);

        $response->assertRedirect();

        $this->assertDatabaseHas('columns', [
            'id' => $targetColumn->id,
            'order' => $originalOrder + 1,
        ]);
    }

    /**
     * Test la création réussie d'une colonne par un collaborateur.
     */
    public function test_create_column_by_collaborator_should_success()
    {
        $collaborationUser = User::factory()->create();
        $this->board->users()->save($collaborationUser);

        $requestBody = [
            'name' => 'Test Column',
            'order' => 0,
        ];

        $response = $this
            ->actingAs($collaborationUser)
            ->post(route('web.boards.columns.store', $this->board->id), $requestBody);

        $response->assertRedirect();

        $this->assertDatabaseHas('columns', [
            'board_id' => $this->board->id,
            'name' => 'Test Column',
            'order' => 0,
        ]);
    }

    /**
     * Test la mise à jour réussie d'une colonne par un collaborateur.
     */
    public function test_update_column_by_collaborator_should_success()
    {
        $collaborationUser = User::factory()->create();
        $this->board->users()->save($collaborationUser);

        $column = $this->board->columns()->first();
        $originalName = $column->name;

        $requestBody = [
            'name' => 'Updated Column',
            'color' => $column->color->value,
        ];

        $response = $this
            ->actingAs($collaborationUser)
            ->patch(route('web.columns.update', $column->id), $requestBody);

        $response->assertRedirect();

        $this->assertDatabaseHas('columns', [
            'id' => $column->id,
            'name' => 'Updated Column',
            'color' => $column->color->value,
        ]);
        $this->assertDatabaseMissing('columns', [
            'id' => $column->id,
            'name' => $originalName,
        ]);
    }

    /**
     * Test la suppression réussie d'une colonne par un collaborateur.
     */
    public function test_delete_column_by_collaborator_should_success()
    {
        $collaborationUser = User::factory()->create();
        $this->board->users()->save($collaborationUser);

        $column = $this->board->columns()->first();

        $response = $this
            ->actingAs($collaborationUser)
            ->delete(route('web.columns.destroy', $column->id));

        $response->assertRedirect();

        $this->assertDatabaseMissing('columns', [
            'id' => $column->id,
        ]);
    }

    /**
     * Test la permutation réussie d'une colonne par un collaborateur.
     */
    public function test_swap_column_by_collaborator_should_success()
    {
        $collaborationUser = User::factory()->create();
        $this->board->users()->save($collaborationUser);

        $targetColumn = $this->board->columns()->whereOrder(0)->first();
        $originalOrder = $targetColumn->order;

        $responseBody = [
            'order' => $targetColumn->order + 1,
        ];

        $response = $this
            ->actingAs($collaborationUser)
            ->patch(route('web.columns.swap', $targetColumn->id), $responseBody);

        $response->assertRedirect();

        $this->assertDatabaseHas('columns', [
            'id' => $targetColumn->id,
            'order' => $originalOrder + 1,
        ]);
    }

    /**
     * Test l'échec de la création d'une colonne par un utilisateur non autorisé.
     */
    public function test_create_column_by_unauthorized_user_should_forbidden()
    {
        $unauthorizedUser = User::factory()->create();

        $requestBody = [
            'name' => 'Test Column',
            'order' => 0,
        ];

        $response = $this
            ->actingAs($unauthorizedUser)
            ->post(route('web.boards.columns.store', $this->board->id), $requestBody);

        $response->assertForbidden();
    }

    /**
     * Test l'échec de la mise à jour d'une colonne par un utilisateur non autorisé.
     */
    public function test_update_column_by_unauthorized_user_should_forbidden()
    {
        $unauthorizedUser = User::factory()->create();

        $column = $this->board->columns()->first();

        $requestBody = [
            'name' => 'Updated Column',
            'color' => $column->color->value,
        ];

        $response = $this
            ->actingAs($unauthorizedUser)
            ->patch(route('web.columns.update', $column->id), $requestBody);

        $response->assertForbidden();
    }

    /**
     * Test l'échec de la suppression d'une colonne par un utilisateur non autorisé.
     */
    public function test_delete_column_by_unauthorized_user_should_forbidden()
    {
        $unauthorizedUser = User::factory()->create();

        $column = $this->board->columns()->first();

        $response = $this
            ->actingAs($unauthorizedUser)
            ->delete(route('web.columns.destroy', $column->id));

        $response->assertForbidden();
    }

    /**
     * Test l'échec de la permutation d'une colonne par un utilisateur non autorisé.
     */
    public function test_swap_column_by_unauthorized_user_should_forbidden()
    {
        $unauthorizedUser = User::factory()->create();

        $targetColumn = $this->board->columns()->whereOrder(0)->first();

        $responseBody = [
            'order' => $targetColumn->order + 1,
        ];

        $response = $this
            ->actingAs($unauthorizedUser)
            ->patch(route('web.columns.swap', $targetColumn->id), $responseBody);

        $response->assertForbidden();
    }
}