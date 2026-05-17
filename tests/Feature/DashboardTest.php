<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users are redirected from dashboard to specific dashboard', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'customer']));

    $this->get(route('dashboard'))->assertRedirect(route('client.dashboard'));
});