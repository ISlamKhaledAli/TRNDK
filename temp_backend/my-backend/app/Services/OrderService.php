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
