<?php

namespace Database\Seeders;

use App\Models\CustomerOrder;
use App\Models\Message;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class MessageTestDataSeeder extends Seeder
{
    public function run(): void
    {
        if (!Schema::hasTable('messages') || !Schema::hasTable('customer_orders')) {
            return;
        }

        $orders = CustomerOrder::query()
            ->with(['customer.user', 'provider.user'])
            ->get()
            ->filter(fn (CustomerOrder $order) => $order->customer?->user && $order->provider?->user)
            ->values();

        foreach ($orders as $order) {
            $customerUser = $order->customer->user;
            $providerUser = $order->provider->user;

            $messages = [
                [
                    'sender_id' => $providerUser->id,
                    'receiver_id' => $customerUser->id,
                    'content' => "Hello {$customerUser->first_name}, I reviewed your {$order->service_name} request.",
                    'is_read' => true,
                    'created_at' => $order->created_at?->copy()->addHour() ?? now()->subHours(6),
                ],
                [
                    'sender_id' => $customerUser->id,
                    'receiver_id' => $providerUser->id,
                    'content' => 'Great, thank you. Please let me know your arrival estimate.',
                    'is_read' => true,
                    'created_at' => $order->created_at?->copy()->addHours(2) ?? now()->subHours(5),
                ],
                [
                    'sender_id' => $providerUser->id,
                    'receiver_id' => $customerUser->id,
                    'content' => 'I should arrive within 30 minutes. I will message you once I am nearby.',
                    'is_read' => false,
                    'created_at' => $order->created_at?->copy()->addHours(3) ?? now()->subHours(4),
                ],
            ];

            foreach ($messages as $messageData) {
                Message::updateOrCreate(
                    [
                        'order_id' => $order->id,
                        'sender_id' => $messageData['sender_id'],
                        'receiver_id' => $messageData['receiver_id'],
                        'content' => $messageData['content'],
                    ],
                    [
                        'is_read' => $messageData['is_read'],
                        'created_at' => $messageData['created_at'],
                        'updated_at' => $messageData['created_at'],
                    ],
                );
            }
        }
    }
}
