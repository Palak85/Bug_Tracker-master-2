<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
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
            'status'      => fake()->randomElement(['open', 'in_progress', 'resolved']),
            'priority'    => fake()->randomElement(['low', 'medium', 'high', 'urgent']),
            'deadline'    => fake()->boolean(80) ? fake()->dateTimeBetween('now', '+1 month') : null,
            'assigned_to' => fake()->boolean(70) ? \App\Models\User::factory() : null,
        ];
    }
}
