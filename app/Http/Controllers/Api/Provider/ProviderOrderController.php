<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerOrderResource;
use App\Models\CustomerOrder;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;

class ProviderOrderController extends Controller
{
    use ApiResponses;

    public function updateStatus(Request $request, CustomerOrder $order)
    {
        $provider = $request->user()?->provider;

        if (!$provider) {
            return $this->error('Provider profile not found.', 404);
        }

        if ((int) $order->provider_id !== (int) $provider->id) {
            return $this->error('You are not allowed to update this order.', 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:confirmed,cancelled',
        ]);

        $nextStatus = $validated['status'];
        $currentStatus = (string) $order->status;

        if ($nextStatus === 'confirmed' && $currentStatus !== 'pending') {
            return $this->error('Only pending orders can be accepted.', 422);
        }

        if ($nextStatus === 'cancelled' && !in_array($currentStatus, ['pending', 'confirmed'], true)) {
            return $this->error('Only pending or confirmed orders can be declined.', 422);
        }

        $order->update(['status' => $nextStatus]);
        $order->load(['customer.user', 'address']);

        return $this->ok('Order status updated successfully.', [
            'order' => new CustomerOrderResource($order),
        ]);
    }
}
