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
