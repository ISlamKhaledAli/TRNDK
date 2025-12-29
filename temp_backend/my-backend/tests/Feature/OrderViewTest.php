<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Order;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderViewTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_own_orders()
    {
        // 1. نجهز يوزر وخدمة وأوردر خاص بيه
        /** @var User $user */
        $user = User::factory()->create(['role' => 'customer']);
        $service = Service::factory()->create();
        
        $order = Order::create([
            'user_id' => $user->id,
            'service_id' => $service->id,
            'quantity' => 2,
            'total_price' => 200
        ]);

        // 2. اليوزر يطلب قائمة أوردراته
        $response = $this->actingAs($user)->getJson('/api/v1/orders');

        // 3. نتأكد إنه شاف الأوردر بتاعه
        $response->assertStatus(200)
                 ->assertJsonCount(1) // المفروض يرجع أوردر واحد
                 ->assertJsonFragment(['id' => $order->id]);
    }
    public function test_admin_can_view_all_orders()
    {
        // 1. نجهز أدمن
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);

        // 2. نجهز 2 يوزرز مختلفين بـ 2 أوردر
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $service = Service::factory()->create();

        Order::create(['user_id' => $user1->id, 'service_id' => $service->id, 'quantity' => 1, 'total_price' => 100]);
        Order::create(['user_id' => $user2->id, 'service_id' => $service->id, 'quantity' => 1, 'total_price' => 100]);

        // 3. الأدمن يطلب القائمة
        $response = $this->actingAs($admin)->getJson('/api/v1/orders');

        // 4. الأدمن المفروض يشوف الاتنين
        $response->assertStatus(200)
                 ->assertJsonCount(2); 
    }
}