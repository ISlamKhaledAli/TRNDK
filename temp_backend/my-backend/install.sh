#!/bin/bash

echo "🚀 Starting Digital Platform Backend Installation..."

# 1. Create Directory Structure
echo "📂 Creating directories..."
mkdir -p app/Http/Controllers/Api/V1/Admin
mkdir -p app/Http/Controllers/Api/V1/Customer
mkdir -p app/Http/Controllers/Api/V1/Public
mkdir -p app/Http/Middleware
mkdir -p app/Services
mkdir -p app/Models
mkdir -p app/Http/Requests

# 2. Database Migration
echo "Database: Writing Migration..."
cat << 'EOF' > database/migrations/2025_01_01_000000_create_digital_platform_tables.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Users (Modifying existing or creating new if clean slate)
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('password');
                $table->rememberToken();
                $table->timestamps();
            });
        }
        
        // Add columns to users if they don't exist
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['customer', 'admin', 'staff'])->default('customer');
                $table->enum('status', ['active', 'suspended'])->default('active');
                $table->timestamp('last_login_at')->nullable();
            }
        });

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

        Schema::create('service_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->string('image_path');
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamp('created_at')->useCurrent();
        });

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

        Schema::create('order_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('field_name');
            $table->text('field_value')->nullable();
        });

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

        Schema::create('service_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('order_id')->constrained();
            $table->tinyInteger('rating')->unsigned();
            $table->text('comment')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('order_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('old_status');
            $table->string('new_status');
            $table->foreignId('changed_by')->constrained('users');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_logs');
        Schema::dropIfExists('service_reviews');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_details');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('service_images');
        Schema::dropIfExists('services');
    }
};
EOF

# 3. Models
echo "Models: Writing Eloquent Models..."

# User Model
cat << 'EOF' > app/Models/User.php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'status', 'last_login_at'];
    protected $hidden = ['password', 'remember_token'];

    public function isAdmin(): bool { return $this->role === 'admin'; }
    public function orders() { return $this->hasMany(Order::class, 'user_id'); }
}
EOF

# Order Model
cat << 'EOF' > app/Models/Order.php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded = ['id'];
    protected $casts = ['metadata' => 'array', 'status_changed_at' => 'datetime'];

    public function customer() { return $this->belongsTo(User::class, 'user_id'); }
    public function service() { return $this->belongsTo(Service::class); }
    public function details() { return $this->hasMany(OrderDetail::class); }
    public function payment() { return $this->hasOne(Payment::class); }
    public function logs() { return $this->hasMany(OrderStatusLog::class); }
}
EOF

# OrderDetail Model
cat << 'EOF' > app/Models/OrderDetail.php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class OrderDetail extends Model {
    protected $guarded = ['id'];
    public $timestamps = false;
}
EOF

# Service Model
cat << 'EOF' > app/Models/Service.php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $guarded = ['id'];
    protected $casts = ['input_schema' => 'array', 'is_active' => 'boolean', 'requires_input' => 'boolean'];
    public function images() { return $this->hasMany(ServiceImage::class); }
}
EOF

# ServiceImage Model
cat << 'EOF' > app/Models/ServiceImage.php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ServiceImage extends Model { protected $guarded = ['id']; public $timestamps = false; }
EOF

# Payment Model
cat << 'EOF' > app/Models/Payment.php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Payment extends Model { protected $guarded = ['id']; protected $casts = ['raw_response' => 'array']; }
EOF

# OrderStatusLog Model
cat << 'EOF' > app/Models/OrderStatusLog.php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class OrderStatusLog extends Model { protected $guarded = ['id']; public $timestamps = false; }
EOF

# 4. Service Layer
echo "Services: Writing OrderService..."
cat << 'EOF' > app/Services/OrderService.php
<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusLog;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderService
{
    public function updateStatus(Order $order, string $newStatus, int $userId): Order
    {
        if ($order->status === $newStatus) return $order;

        if ($newStatus === 'processing' && $order->status === 'pending') {
            throw new Exception("Cannot process unpaid order.");
        }

        return DB::transaction(function () use ($order, $newStatus, $userId) {
            $oldStatus = $order->status;
            $order->update(['status' => $newStatus, 'status_changed_at' => now()]);

            OrderStatusLog::create([
                'order_id' => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'changed_by' => $userId,
            ]);

            return $order;
        });
    }

    public function createOrder(array $data, array $details, int $userId): Order
    {
        return DB::transaction(function () use ($data, $details, $userId) {
            $order = Order::create([...$data, 'user_id' => $userId, 'status' => 'pending']);
            foreach ($details as $key => $value) {
                $order->details()->create([
                    'field_name' => $key,
                    'field_value' => is_array($value) ? json_encode($value) : $value,
                ]);
            }
            return $order;
        });
    }
}
EOF

# 5. Controllers
echo "Controllers: Writing API Controllers..."

# Auth Controller
cat << 'EOF' > app/Http/Controllers/Api/V1/AuthController.php
<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request) {
        $request->validate(['email' => 'required|email', 'password' => 'required']);
        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages(['email' => ['Invalid credentials']]);
        }
        return response()->json(['token' => $user->createToken('api')->plainTextToken, 'role' => $user->role]);
    }
    
    public function register(Request $request) {
        $data = $request->validate([
            'name' => 'required', 'email' => 'required|email|unique:users', 'password' => 'required|min:6'
        ]);
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);
        return response()->json(['token' => $user->createToken('api')->plainTextToken, 'user' => $user], 201);
    }

    public function me(Request $request) { return $request->user(); }
    public function logout(Request $request) { $request->user()->currentAccessToken()->delete(); return response()->noContent(); }
}
EOF

# Customer Order Controller
cat << 'EOF' > app/Http/Controllers/Api/V1/Customer/OrderController.php
<?php
namespace App\Http\Controllers\Api\V1\Customer;
use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected $orderService;
    public function __construct(OrderService $s) { $this->orderService = $s; }

    public function index(Request $request) {
        return $request->user()->orders()->with('service')->latest()->paginate(10);
    }

    public function store(Request $request) {
        $request->validate(['service_id' => 'required|exists:services,id', 'quantity' => 'required|integer|min:1']);
        $service = Service::find($request->service_id);
        $total = $service->base_price * $request->quantity;
        
        $order = $this->orderService->createOrder(
            ['service_id' => $service->id, 'quantity' => $request->quantity, 'total_price' => $total, 'source' => 'web'],
            $request->input('details', []),
            $request->user()->id
        );
        return response()->json($order, 201);
    }
}
EOF

# Admin Service Controller
cat << 'EOF' > app/Http/Controllers/Api/V1/Admin/ServiceController.php
<?php
namespace App\Http\Controllers\Api\V1\Admin;
use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function store(Request $request) {
        $data = $request->validate([
            'title' => 'required', 'base_price' => 'required|numeric', 
            'category' => 'required', 'unit_name' => 'required', 
            'unit_label' => 'required', 'service_type' => 'required', 'delivery_type' => 'required'
        ]);
        return Service::create($data);
    }
    public function index() { return Service::all(); }
}
EOF

# Admin/Staff Order Manager
cat << 'EOF' > app/Http/Controllers/Api/V1/Admin/OrderManagementController.php
<?php
namespace App\Http\Controllers\Api\V1\Admin;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderManagementController extends Controller
{
    protected $orderService;
    public function __construct(OrderService $s) { $this->orderService = $s; }

    public function index() { return Order::with(['customer', 'service'])->latest()->paginate(20); }
    
    public function updateStatus(Request $request, $id) {
        $request->validate(['status' => 'required']);
        try {
            $order = Order::findOrFail($id);
            $this->orderService->updateStatus($order, $request->status, $request->user()->id);
            return response()->json(['message' => 'Updated']);
        } catch (\Exception $e) { return response()->json(['error' => $e->getMessage()], 400); }
    }
}
EOF

# Public Service Controller
cat << 'EOF' > app/Http/Controllers/Api/V1/Public/ServiceController.php
<?php
namespace App\Http\Controllers\Api\V1\Public;
use App\Http\Controllers\Controller;
use App\Models\Service;

class ServiceController extends Controller
{
    public function index() { return Service::where('is_active', true)->paginate(15); }
    public function show($id) { return Service::with('images')->findOrFail($id); }
}
EOF

# 6. Middleware
echo "Middleware: Creating Role Middleware..."
cat << 'EOF' > app/Http/Middleware/EnsureUserHasRole.php
<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        if (!$request->user() || $request->user()->role !== $role) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return $next($request);
    }
}
EOF

# 7. Routes
echo "Routes: writing api.php..."
cat << 'EOF' > routes/api.php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\Public\ServiceController as PublicServiceController;
use App\Http\Controllers\Api\V1\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Api\V1\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Api\V1\Admin\OrderManagementController;
use App\Http\Middleware\EnsureUserHasRole;

Route::prefix('v1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/services', [PublicServiceController::class, 'index']);
    Route::get('/services/{id}', [PublicServiceController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Customer
        Route::middleware(EnsureUserHasRole::class.':customer')->group(function () {
            Route::post('/orders', [CustomerOrderController::class, 'store']);
            Route::get('/orders/my', [CustomerOrderController::class, 'index']);
        });

        // Admin
        Route::middleware(EnsureUserHasRole::class.':admin')->prefix('admin')->group(function () {
            Route::post('/services', [AdminServiceController::class, 'store']);
            Route::get('/orders', [OrderManagementController::class, 'index']);
            Route::patch('/orders/{id}/status', [OrderManagementController::class, 'updateStatus']);
        });
    });
});
EOF

echo "✅ Installation Complete!"
