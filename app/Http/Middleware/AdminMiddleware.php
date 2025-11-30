<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar que el usuario esté autenticado
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        // Verificar que el usuario tenga el rol de admin
        // Asumiendo que tienes un campo 'role' en el modelo User
        if (auth()->user()->role !== 'admin') {
            abort(403, 'No tienes permisos para acceder a esta área.');
        }

        return $next($request);
    }
}
