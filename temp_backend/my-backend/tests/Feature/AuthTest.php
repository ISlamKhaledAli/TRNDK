<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_valid_data()
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'New User',
            'email' => 'new@user.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['token', 'user']);
    }

    public function test_user_cannot_register_with_existing_email()
    {
        // Create user first
        User::factory()->create(['email' => 'duplicate@test.com']);

        // Try to register again
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Another User',
            'email' => 'duplicate@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422) // Unprocessable Entity
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_user_cannot_login_with_wrong_password()
    {
        $user = User::factory()->create(['password' => bcrypt('correct-password')]);

        $response = $this->postJson('/api/v1/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401); // Unauthorized
    }

    public function test_authenticated_user_can_get_profile()
    {
        /** @var User $user */
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->getJson('/api/v1/me');

        $response->assertStatus(200)
                 ->assertJson(['data' => ['email' => $user->email]]);
    }
}