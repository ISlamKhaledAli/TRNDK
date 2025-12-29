<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph,
            'base_price' => 100,
            'service_type' => 'physical',
            'delivery_type' => 'onsite',
            
            // ✅ السطر ده هو الحل السحري للمشكلة دي
            'category' => 'General', 
            
            // بيانات إضافية عشان نمنع أي أخطاء تانية
            'unit_name' => 'Hour',
            'unit_label' => 'hr',
        ];
    }
}