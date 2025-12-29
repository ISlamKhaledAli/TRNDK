<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Users
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['customer', 'admin', 'staff'])->default('customer');
            $table->enum('status', ['active', 'suspended'])->default('active');
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // 2. Services
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('category');
            $table->decimal('base_price', 10, 2);
            $table->integer('min_quantity')->default(1);
            $table->integer('max_quantity')->nullable();
            $table->string('unit_name');
            $table->string('unit_label');
            $table->string('service_type');
            $table->string('delivery_type');
            $table->boolean('requires_input')->default(false);
            $table->json('input_schema')->nullable();
            $table->string('thumbnail')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Service Images
        Schema::create('service_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->string('image_path');
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamp('created_at')->useCurrent();
        });

        // 4. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('service_id')->constrained('services');
            $table->integer('quantity');
            $table->decimal('total_price', 10, 2);
            $table->enum('status', ['pending', 'paid', 'processing', 'completed', 'failed'])->default('pending');
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->string('source')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('status_changed_at')->useCurrent();
            $table->timestamps();
        });

        // 5. Order Details
        Schema::create('order_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('field_name');
            $table->text('field_value')->nullable();
        });

        // 6. Payments
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('USD');
            $table->string('provider');
            $table->string('payment_status');
            $table->string('status_reason')->nullable();
            $table->integer('attempts')->default(0);
            $table->string('transaction_id')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // 7. Service Reviews
        Schema::create('service_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('order_id')->constrained();
            $table->tinyInteger('rating')->unsigned();
            $table->text('comment')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // 8. Order Status Logs
        Schema::create('order_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('old_status');
            $table->string('new_status');
            $table->foreignId('changed_by')->constrained('users');
            $table->timestamp('created_at')->useCurrent();
        });

        // 9. Sessions (المهم جداً عشان ميعملش معاك مشاكل)
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
        // 10. Personal Access Tokens (Sanctum)
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        // الترتيب هنا مهم عشان الـ Foreign Keys
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('order_status_logs');
        Schema::dropIfExists('service_reviews');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_details');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('service_images');
        Schema::dropIfExists('services');
        Schema::dropIfExists('users');
    }
};