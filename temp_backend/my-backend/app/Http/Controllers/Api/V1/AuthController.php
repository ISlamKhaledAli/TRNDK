<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    public function login(Request $request) {
        $request->validate(['email' => 'required|email', 'password' => 'required']);
        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
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

    public function me(Request $request) { return new UserResource($request->user());}
    public function logout(Request $request) { $request->user()->currentAccessToken()->delete(); return response()->noContent(); }
}
