<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_service()
    {
        $this->withoutExceptionHandling();
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/v1/services', [
            'title' => 'New Service',
            'description' => 'Desc',
            'category' => 'Tech',
            'base_price' => 200, // ✅ تمام الاسم صح
            'unit_name' => 'fix',
            'unit_label' => 'Fix',
            'service_type' => 'physical',
            'delivery_type' => 'onsite',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('services', ['title' => 'New Service']);
    }

    public function test_customer_cannot_create_service()
    {
        /** @var User $customer */
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer)->postJson('/api/v1/services', [
            'title' => 'Hacker Service',
            'description' => 'Desc',
            'base_price' => 100, // نبعت داتا كاملة عشان نتأكد إن الرفض بسبب الصلاحية مش بسبب نقص البيانات
            'service_type' => 'physical',
            'delivery_type' => 'onsite',
        ]);

        // ✅ تمام هيرجع 403 Forbidden
        $response->assertStatus(403); 
    }

    public function test_admin_can_delete_service()
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);
        
        // 1. ننشئ خدمة عشان نمسحها
        $service = Service::create([
            'title' => 'To Delete',
            'description' => 'Desc',
            'category' => 'Tech',
            'base_price' => 100,
            'unit_name' => 'unit',
            'unit_label' => 'Unit',
            'service_type' => 'type',
            'delivery_type' => 'type',
        ]);

       // 2. ❌ هنا كان الغلط: كنت بتعمل postJson بدل deleteJson
       // ✅ التصحيح:
       $response = $this->actingAs($admin)->deleteJson("/api/v1/services/{$service->id}");
        
       $response->assertStatus(200); // تأكد إن الكنترولر بيرجع 200 مش 204
       $this->assertDatabaseMissing('services', ['id' => $service->id]);
    }

    public function test_admin_can_update_service()
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);

        // 1. ننشئ خدمة قديمة عشان نعدلها
        $service = Service::factory()->create([
            'title' => 'Old Title',
            'base_price' => 100,
        ]);

        // 2. نبعت طلب تعديل (PUT) ببيانات جديدة
        $response = $this->actingAs($admin)->putJson("/api/v1/services/{$service->id}", [
            'title' => 'Updated Title', // الاسم الجديد
            'description' => 'Updated Description',
            'base_price' => 500,        // السعر الجديد
            'service_type' => 'physical',
            'delivery_type' => 'onsite',
            'category' => 'Tech',       // لازم نبعتها عشان الـ Validation
        ]);

        // 3. التوقعات
        $response->assertStatus(200);

        // نتأكد إن الاسم القديم اختفى
        $this->assertDatabaseMissing('services', ['title' => 'Old Title']);
        
        // نتأكد إن الاسم الجديد والسعر الجديد اتسجلوا
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'title' => 'Updated Title',
            'base_price' => 500
        ]);
    }
}