<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Models\CustomerOrder;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;

class ProviderJobRequestController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $provider = $request->user()->provider;

        if (!$provider) {
            return $this->error('Provider profile not found.', 404);
        }

        $query = CustomerOrder::where('provider_id', $provider->id)
            ->with(['customer.user', 'address']);

        // Search by customer name or service name
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('service_name', 'like', "%{$search}%")
                  ->orWhereHas('customer.user', function ($uq) use ($search) {
                      $uq->where('first_name', 'like', "%{$search}%")
                         ->orWhere('last_name', 'like', "%{$search}%")
                         ->orWhere('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status (default to pending, confirmed, in_progress, but support all)
        $status = $request->input('status');
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Sort by newest scheduled requests
        $query->orderBy('scheduled_at', 'desc');

        $jobRequests = $query->paginate(15);

        return $this->ok('Job requests retrieved successfully.', [
            'jobRequests' => $jobRequests
        ]);
    }

    public function updateStatus(Request $request, CustomerOrder $order)
    {
        $provider = $request->user()->provider;

        if (!$provider || $order->provider_id !== $provider->id) {
            return $this->error('Unauthorized to update this order.', 403);
        }

        $validatedData = $request->validate([
            'status' => 'required|in:confirmed,cancelled,in_progress,completed'
        ]);

        $newStatus = $validatedData['status'];
        $currentStatus = $order->status;

        // Prevent invalid transitions based on requirements
        $validTransition = false;
        if ($currentStatus === 'pending' && in_array($newStatus, ['confirmed', 'cancelled'])) {
            $validTransition = true;
        } elseif ($currentStatus === 'confirmed' && in_array($newStatus, ['in_progress', 'cancelled'])) {
            $validTransition = true;
        } elseif ($currentStatus === 'in_progress' && $newStatus === 'completed') {
            $validTransition = true;
        }

        if (!$validTransition) {
            return $this->error("Cannot transition order from {$currentStatus} to {$newStatus}.", 422);
        }

        $order->update([
            'status' => $newStatus
        ]);

        return $this->ok('Order status updated successfully.', [
            'order' => $order
        ]);
    }
}
