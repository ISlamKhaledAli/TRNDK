<?php
namespace App\Http\Controllers\Api\V1\Customer;
use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected $orderService;
    public function __construct(OrderService $s) { $this->orderService = $s; }

 public function index(Request $request)
    {
        // لو المستخدم أدمن، رجع كل الأوردرات
        $orders = Order::with(['user', 'service'])->get();

        // لو مستخدم عادي، رجع أوردراته هو بس (علاقة الـ HasMany)
         return response()->json($orders, 200);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id', // تأكد إن الخدمة موجودة
            'quantity' => 'required|integer|min:1', // الكمية لازم تكون موجبة
        ]);

        // 1. نجيب الخدمة عشان نعرف سعرها
        $service = Service::findOrFail($validated['service_id']);
 
        // 2. نحسب السعر الإجمالي
       $totalPrice = $service->base_price * $validated['quantity'];

        // 3. ننشئ الأوردر
        $order = $request->user()->orders()->create([
            'service_id' => $validated['service_id'],
            'quantity' => $validated['quantity'],
            'total_price' => $totalPrice, // <--- هنا الحل
        ]);

        return response()->json($order, 201);
    }
    public function updateStatus() {}
}
