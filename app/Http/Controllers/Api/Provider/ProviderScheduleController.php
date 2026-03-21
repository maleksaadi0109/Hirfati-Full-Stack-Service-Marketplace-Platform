<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Models\CustomerOrder;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;

class ProviderScheduleController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $provider = $request->user()->provider;

        if (!$provider) {
            return $this->error('Provider profile not found.', 404);
        }

        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
            'status' => 'nullable|string',
        ]);

        $query = CustomerOrder::where('provider_id', $provider->id)
            ->whereBetween('scheduled_at', [$request->from, \Carbon\Carbon::parse($request->to)->endOfDay()])
            ->with(['customer.user']);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('scheduled_at', 'asc')->get()->map(function ($order) {
            return [
                'id' => $order->id,
                'customer_name' => collect([
                    $order->customer->user->first_name ?? '',
                    $order->customer->user->last_name ?? ''
                ])->filter()->join(' ') ?: ($order->customer->user->name ?? 'Unknown Customer'),
                'service' => $order->service_name,
                'scheduled_at' => $order->scheduled_at,
                'status' => $order->status,
                'amount' => $order->total,
            ];
        });

        return $this->ok('Schedule retrieved successfully', ['schedule' => $orders]);
    }

    public function updateStatus(Request $request, CustomerOrder $order)
    {
        $provider = $request->user()->provider;

        if (!$provider || $order->provider_id !== $provider->id) {
            return $this->error('Unauthorized to update this order.', 403);
        }

        $request->validate([
            'status' => 'required|string|in:confirmed,in_progress,completed,cancelled',
        ]);

        $newStatus = $request->status;
        $currentStatus = $order->status;

        // Enforce valid transitions
        $validTransitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['in_progress', 'cancelled'],
            'in_progress' => ['completed', 'cancelled'],
            'completed' => [],
            'cancelled' => [],
        ];

        if (!in_array($newStatus, $validTransitions[$currentStatus] ?? [])) {
            return $this->error("Invalid status transition from {$currentStatus} to {$newStatus}.", 422);
        }

        $order->update(['status' => $newStatus]);

        return $this->ok('Order status updated successfully', ['order' => $order]);
    }
}
