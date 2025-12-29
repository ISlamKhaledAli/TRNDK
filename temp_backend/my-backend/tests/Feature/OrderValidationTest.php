<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderValidationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    // الدالة دي بتشتغل أوتوماتيك قبل كل تيست
    protected function setUp(): void
    {
        parent::setUp();

        // 1. بنكريت اليوزر "كاستمر" مرة واحدة هنا
        $this->user = User::factory()->create(['role' => 'customer']);
        
        // 2. بنعمل تسجيل دخول بيه عشان كل التيستات تستخدمه
        $this->actingAs($this->user);
    }

    public function test_cannot_order_non_existent_service()
    {
        // مش محتاجين نكريت يوزر هنا، خلاص عملناه في setUp

        $response = $this->postJson('/api/v1/orders', [
            'service_id' => 9999, // رقم غير موجود
            'quantity' => 1
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['service_id']);
    }

    public function test_quantity_must_be_positive()
    {
        // نكريت خدمة عشان نجرب عليها
        $service = Service::create([
             'title' => 'Test Service', 
             'description' => 'Desc', 
             'category' => 'General', 
             'base_price' => 100, 
             'unit_name' => 'hour', 
             'unit_label' => 'Hour',
             'service_type' => 'physical', 
             'delivery_type' => 'onsite'
        ]);

        // محاولة طلب كمية سالب
        $response = $this->postJson('/api/v1/orders', [
            'service_id' => $service->id,
            'quantity' => -5 
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['quantity']);
    }
}