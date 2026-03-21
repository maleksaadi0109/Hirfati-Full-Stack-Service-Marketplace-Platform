<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\CustomerOrder;
use App\Models\Message;
use App\Models\Provider;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;

class DashboardSummaryController extends Controller
{
    use ApiResponses;
    

    public function __invoke(Request $request)
    {
        $user = $request->user();
        $customer = $user?->customer;

        if (!$customer) {
            return $this->error('Customer profile not found.', 404);
        }

        $ordersQuery = CustomerOrder::query()->where('customer_id', $customer->id);

        $totalOrders = (clone $ordersQuery)->count();
        $activeOrders = (clone $ordersQuery)
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->count();
        $pendingOrders = (clone $ordersQuery)->where('status', 'pending')->count();
        $completedOrders = (clone $ordersQuery)->where('status', 'completed')->count();
        $cancelledOrders = (clone $ordersQuery)->where('status', 'cancelled')->count();

        $completedSpend = (float) ((clone $ordersQuery)
            ->where('status', 'completed')
            ->sum('total'));
        $paidSpend = (float) ((clone $ordersQuery)
            ->where('payment_status', 'paid')
            ->sum('total'));

        $unreadMessages = Message::query()
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->whereHas('order', function ($query) use ($customer) {
                $query->where('customer_id', $customer->id);
            })
            ->count();

        $pendingQuotes = CustomerOrder::query()
            ->where('customer_id', $customer->id)
            ->whereHas('messages', function ($query) use ($user) {
                $query->where('receiver_id', $user->id)
                    ->where('is_read', false);
            })
            ->count();

        $nextOrder = CustomerOrder::query()
            ->where('customer_id', $customer->id)
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->where('scheduled_at', '>=', now())
            ->with(['provider.user'])
            ->orderBy('scheduled_at')
            ->first();

        $recentOrders = CustomerOrder::query()
            ->where('customer_id', $customer->id)
            ->with(['provider.user'])
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
                    'provider_name' => $order->provider?->user?->name,
                ];
            })
            ->values();

        $recommendedProviders = Provider::query()
            ->where('application_status', 'approved')
            ->latest()
            ->limit(6)
            ->get(['id'])
            ->count();

        return $this->ok('Dashboard summary loaded successfully.', [
            'metrics' => [
                'total_orders' => $totalOrders,
                'active_orders' => $activeOrders,
                'pending_orders' => $pendingOrders,
                'completed_orders' => $completedOrders,
                'cancelled_orders' => $cancelledOrders,
                'unread_messages' => $unreadMessages,
                'pending_quotes' => $pendingQuotes,
                'completed_spend' => $completedSpend,
                'paid_spend' => $paidSpend,
                'recommended_providers' => $recommendedProviders,
            ],
            'next_order' => $nextOrder ? [
                'id' => $nextOrder->id,
                'service' => $nextOrder->service_name,
                'status' => $nextOrder->status,
                'scheduled_at' => $nextOrder->scheduled_at?->toISOString(),
                'provider_name' => $nextOrder->provider?->user?->name,
            ] : null,
            'recent_orders' => $recentOrders,
        ]);
    }
}
