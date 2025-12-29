<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Payment extends Model { protected $guarded = ['id']; protected $casts = ['raw_response' => 'array']; }
