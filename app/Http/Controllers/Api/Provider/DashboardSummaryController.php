<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Models\CustomerOrder;
use App\Models\Message;
use App\Models\ProviderPost;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;

class DashboardSummaryController extends Controller
{
    use ApiResponses;

    public function __invoke(Request $request)
    {
        $user = $request->user();
        $provider = $user?->provider;

        if (!$provider) {
            return $this->error('Provider profile not found.', 404);
        }

        $ordersQuery = CustomerOrder::query()->where('provider_id', $provider->id);

        $totalOrders = (clone $ordersQuery)->count();
        $activeOrders = (clone $ordersQuery)
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->count();
        $pendingOrders = (clone $ordersQuery)->where('status', 'pending')->count();
        $completedOrders = (clone $ordersQuery)->where('status', 'completed')->count();
        $cancelledOrders = (clone $ordersQuery)->where('status', 'cancelled')->count();

        $earningsCompleted = (float) ((clone $ordersQuery)
            ->where('status', 'completed')
            ->sum('total'));
        $earningsPaid = (float) ((clone $ordersQuery)
            ->where('payment_status', 'paid')
            ->sum('total'));

        $unreadMessages = Message::query()
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->whereHas('order', function ($query) use ($provider) {
                $query->where('provider_id', $provider->id);
            })
            ->count();

        $portfolioPosts = ProviderPost::query()
            ->where('provider_id', $provider->id)
            ->count();
        $publishedPosts = ProviderPost::query()
            ->where('provider_id', $provider->id)
            ->where('is_published', true)
            ->count();

        $nextOrder = CustomerOrder::query()
            ->where('provider_id', $provider->id)
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->where('scheduled_at', '>=', now())
            ->with(['customer.user'])
            ->orderBy('scheduled_at')
            ->first();

        $recentOrders = CustomerOrder::query()
            ->where('provider_id', $provider->id)
            ->with(['customer.user'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function (CustomerOrder $order) {
                return [
                    'id' => $order->id,
                    'service' => $order->service_name,
                    'status' => $order->status,
                    'scheduled_at' => $order->scheduled_at?->toISOString(),
                    'total' => (float) $order->total,
                    'customer_name' => $order->customer?->user?->name,
                ];
            })
            ->values();

        $responseRate = $totalOrders > 0
            ? (int) round((($totalOrders - $pendingOrders) / $totalOrders) * 100)
            : 100;

        return $this->ok('Dashboard summary loaded successfully.', [
            'metrics' => [
                'total_orders' => $totalOrders,
                'active_orders' => $activeOrders,
                'pending_orders' => $pendingOrders,
                'completed_orders' => $completedOrders,
                'cancelled_orders' => $cancelledOrders,
                'unread_messages' => $unreadMessages,
                'earnings_completed' => $earningsCompleted,
                'earnings_paid' => $earningsPaid,
                'portfolio_posts' => $portfolioPosts,
                'published_posts' => $publishedPosts,
                'response_rate' => $responseRate,
            ],
            'next_order' => $nextOrder ? [
                'id' => $nextOrder->id,
                'service' => $nextOrder->service_name,
                'status' => $nextOrder->status,
                'scheduled_at' => $nextOrder->scheduled_at?->toISOString(),
                'customer_name' => $nextOrder->customer?->user?->name,
            ] : null,
            'recent_orders' => $recentOrders,
        ]);
    }
}
