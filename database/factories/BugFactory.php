<?php

namespace Database\Factories;

use App\Models\Bug;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bug>
 */
class BugFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title'       => fake()->sentence(),
            'description' => fake()->paragraph(),
            'status'      => fake()->randomElement(['reported', 'in_progress', 'resolved', 'closed']),
            'priority'    => fake()->randomElement(['low', 'medium', 'high', 'urgent']),
            'severity'    => fake()->randomElement(['minor', 'major', 'critical', 'blocker']),
            'created_by'  => \App\Models\User::factory(),
            'assigned_to' => fake()->boolean(70) ? \App\Models\User::factory() : null,
        ];
    }
}
