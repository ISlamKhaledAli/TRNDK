<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Service;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@app.com',
            'password' => Hash::make('password'), // الباسورد
            'role' => 'admin',
        ]);

        // 2. Create Customer
        User::create([
            'name' => 'John Doe',
            'email' => 'client@app.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);

        // 3. Create Services
        Service::create([
            'title' => 'Web Development Consultation',
            'description' => 'One hour consultation with a senior developer.',
            'category' => 'Programming',
            'base_price' => 50.00,
            'unit_name' => 'hour',
            'unit_label' => 'Hours',
            'service_type' => 'consultation',
            'delivery_type' => 'online_meeting',
            'thumbnail' => 'https://placehold.co/600x400',
        ]);

        Service::create([
            'title' => 'Logo Design',
            'description' => 'Professional logo design with 3 revisions.',
            'category' => 'Design',
            'base_price' => 120.00,
            'unit_name' => 'design',
            'unit_label' => 'Logos',
            'service_type' => 'creative',
            'delivery_type' => 'file_upload',
            'requires_input' => true,
            'input_schema' => [
                'brand_name' => 'text',
                'preferred_colors' => 'text'
            ]
        ]);
    }
}