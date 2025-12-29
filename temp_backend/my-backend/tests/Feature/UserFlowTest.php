<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserFlowTest extends TestCase
{
    use RefreshDatabase; // هذا يعيد بناء الداتابيس لكل اختبار عشان يكون نظيف

    public function test_public_user_can_view_services()
    {
        // 1. Create a service
        Service::create([
            'title' => 'Test Service',
            'description' => 'Desc',
            'category' => 'Tech',
            'base_price' => 100,
            'unit_name' => 'hr',
            'unit_label' => 'Hour',
            'service_type' => 'digital',
            'delivery_type' => 'online',
        ]);

        // 2. Hit the endpoint
        $response = $this->getJson('/api/v1/services');

        // 3. Assertions (توقعات)
        $response->assertStatus(200)
                 ->assertJsonStructure(['data']);
    }

    public function test_user_can_login_and_get_token()
    {
        // 1. Create User
        /** @var User $user */
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@app.com',
            'password' => bcrypt('password'),
            'role' => 'customer'
        ]);

        // 2. Try Login
        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@app.com',
            'password' => 'password',
        ]);

        // 3. Check if we got token
        $response->assertStatus(200)
                 ->assertJsonStructure(['token']);
    }

    public function test_customer_can_create_order()
    {
        // 1. Setup Data
        /** @var User $user */
        $user = User::factory()->createOne(['role' => 'customer']);
        $service = Service::create([
            'title' => 'Test Service',
            'description' => 'Desc',
            'category' => 'Tech',
            'base_price' => 100,
            'unit_name' => 'hr',
            'unit_label' => 'Hour',
            'service_type' => 'digital',
            'delivery_type' => 'online',
        ]);

        // 2. Authenticate
        $this->actingAs($user);

        // 3. Make Order Request
        $response = $this->postJson('/api/v1/orders', [
            'service_id' => $service->id,
            'quantity' => 2,
            'details' => ['color' => 'red'] // Dynamic field
        ]);

        // 4. Expect Created (201)
        $response->assertStatus(201);
        
        // 5. Check Database
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'total_price' => 200, // 100 * 2
        ]);
    }

    public function test_guest_cannot_create_order()
    {
        $response = $this->postJson('/api/v1/orders', []);
        $response->assertStatus(401); // Unauthorized
    }
}