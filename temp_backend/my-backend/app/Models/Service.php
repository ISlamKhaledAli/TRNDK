<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    // تأكد إن القائمة دي فيها كل الحقول الجديدة
    protected $fillable = [
        'title',
        'description',
        'base_price',     // <--- تأكد إن دي موجودة ومش price
        'service_type',
        'delivery_type',
        'category',       // لو موجود عندك
        'unit_name',      // لو موجود عندك
        'unit_label',     // لو موجود عندك
    ];
}