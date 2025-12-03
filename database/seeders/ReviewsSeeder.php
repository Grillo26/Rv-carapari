<?php

namespace Database\Seeders;

use App\Models\Place;
use App\Models\User;
use App\Models\Rating;
use App\Models\Review;
use App\Models\UserReview;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class ReviewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('es_ES');
        
        // Get all places and users
        $places = Place::all();
        $users = User::all();
        
        if ($places->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No places or users found. Please seed places and users first.');
            return;
        }
        
        $this->command->info('Creating ratings and reviews...');
        
        foreach ($places as $place) {
            // Create ratings for each place (random number of users rate each place)
            $maxRaters = min($users->count(), 15);
            $numRaters = rand(3, $maxRaters);
            $ratingUsers = $users->random($numRaters);
            
            foreach ($ratingUsers as $user) {
                Rating::updateOrCreate(
                    [
                        'place_id' => $place->id,
                        'user_id' => $user->id,
                    ],
                    [
                        'rating' => $faker->numberBetween(3, 5), // Most ratings are positive
                    ]
                );
            }
            
            // Create reviews for each place (fewer reviews than ratings)
            $maxReviewers = min($ratingUsers->count(), 8);
            $numReviewers = rand(2, $maxReviewers);
            $reviewUsers = $ratingUsers->random($numReviewers);
            
            foreach ($reviewUsers as $user) {
                $review = Review::create([
                    'place_id' => $place->id,
                    'user_id' => $user->id,
                    'title' => $faker->optional(0.7)->sentence(4),
                    'content' => $faker->paragraph(3),
                    'is_approved' => $faker->boolean(85), // 85% are approved
                    'approved_at' => $faker->boolean(85) ? $faker->dateTimeBetween('-1 month', 'now') : null,
                    'approved_by' => $faker->boolean(85) ? $users->where('role', 'admin')->first()?->id : null,
                ]);
                
                // Add some helpful/unhelpful votes to reviews
                if ($review->is_approved) {
                    $otherUsers = $users->where('id', '!=', $user->id);
                    if ($otherUsers->count() > 0) {
                        $maxVoters = min($otherUsers->count(), 5);
                        $numVoters = rand(0, $maxVoters);
                        
                        if ($numVoters > 0) {
                            $voteUsers = $otherUsers->random($numVoters);
                            
                            foreach ($voteUsers as $voteUser) {
                                UserReview::create([
                                    'user_id' => $voteUser->id,
                                    'review_id' => $review->id,
                                    'is_helpful' => $faker->boolean(70), // 70% helpful votes
                                ]);
                            }
                        }
                    }
                }
            }
        }
        
        $this->command->info('Ratings and reviews created successfully!');
    }
}
