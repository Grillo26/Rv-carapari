<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create {--email=admin@test.com} {--password=password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create an admin user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->option('email');
        $password = $this->option('password');

        // Check if user already exists
        if (User::where('email', $email)->exists()) {
            $this->error("User with email {$email} already exists!");
            return 1;
        }

        // Create admin user
        $user = User::create([
            'name' => 'Administrator',
            'email' => $email,
            'email_verified_at' => now(),
            'password' => Hash::make($password),
            'role' => 'admin',
        ]);

        $this->info("Admin user created successfully!");
        $this->info("Email: {$user->email}");
        $this->info("Password: {$password}");
        $this->info("Role: {$user->role}");

        return 0;
    }
}
