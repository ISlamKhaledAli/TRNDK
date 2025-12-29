<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    // حل مشكلة UserFlowTest (Invalid JSON structure)
    public function index()
    {
        return response()->json(['data' => Service::all()]);
    }

    public function show($id)
    {
        return Service::findOrFail($id);
    }

    // حل مشكلة AdminServiceTest (201 vs 200)
    public function store(Request $request)
    {
        // لازم تضيف كل الحقول المطلوبة في الداتابيز هنا
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'base_price' => 'required|numeric',
            'service_type' => 'required',
            'delivery_type' => 'required',
            
            // ✅ الإضافة المهمة لحل مشكلة الـ 500
            'category' => 'required|string', 
            'unit_name' => 'nullable|string', 
            'unit_label' => 'nullable|string',
        ]);

        $service = Service::create($validated);

        return response()->json($service, 201);
    }

    // حل مشكلة عدم الحذف
    public function destroy($id)
    {
        $service = Service::findOrFail($id);
        $service->delete();

        return response()->json(['message' => 'Deleted successfully'], 200);
    }

    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        // نفس قواعد التحقق بتاعت الـ store تقريباً
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'base_price' => 'required|numeric',
            'service_type' => 'required',
            'delivery_type' => 'required',
            'category' => 'required|string',
            'unit_name' => 'nullable|string',
            'unit_label' => 'nullable|string',
        ]);

        // تحديث البيانات
        $service->update($validated);

        return response()->json($service, 200);
    }
}