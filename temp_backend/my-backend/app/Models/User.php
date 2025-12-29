<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'status', 'last_login_at'];
    protected $hidden = ['password', 'remember_token'];

    public function isAdmin(): bool { return $this->role === 'admin'; }
    public function orders() { return $this->hasMany(Order::class, 'user_id'); }
}
