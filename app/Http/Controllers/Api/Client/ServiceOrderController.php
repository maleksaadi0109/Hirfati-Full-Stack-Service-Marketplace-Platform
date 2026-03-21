<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerOrderResource;
use App\Models\CustomerOrder;
use App\Models\CustomerAddress;
use App\Models\Provider;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceOrderController extends Controller
{
    use ApiResponses;

    public function store(Request $request)
    {
        $this->authorize('create', CustomerOrder::class);

        $validated = $request->validate([
            'provider_id' => ['required', 'integer', 'exists:providers,id'],
            'service_name' => ['required', 'string', 'max:255'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'address_id' => ['nullable', 'integer'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'budget' => ['required', 'numeric', 'min:0', 'max:999999.99'],
        ]);

        $user = $request->user();
        $customer = $user?->customer;

        if (!$customer) {
            return $this->error('Customer profile not found.', 404);
        }

        $provider = Provider::query()
            ->where('id', $validated['provider_id'])
            ->where('application_status', 'approved')
            ->first();

        if (!$provider) {
            return $this->error('Selected provider is not available for booking.', 422);
        }

        $addressId = null;
        if (array_key_exists('address_id', $validated) && $validated['address_id'] !== null && (int) $validated['address_id'] !== 0) {
            $address = CustomerAddress::query()
                ->where('id', $validated['address_id'])
                ->where('customer_id', $customer->id)
                ->first();

            if (!$address) {
                return $this->error('The selected address does not belong to your account.', 422);
            }

            $addressId = $address->id;
        }

        $budget = (float) $validated['budget'];

        $order = DB::transaction(function () use ($customer, $validated, $addressId, $budget) {
            return CustomerOrder::query()->create([
                'customer_id' => $customer->id,
                'provider_id' => $validated['provider_id'],
                'address_id' => $addressId,
                'service_name' => $validated['service_name'],
                'scheduled_at' => $validated['scheduled_at'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
                'payment_status' => 'pending',
                'subtotal' => $budget,
                'fees' => 0,
                'total' => $budget,
            ]);
        });

        $order->load(['provider.user', 'address']);

        return $this->success('Order created successfully.', [
            'order_id' => $order->id,
            'status' => $order->status,
            'order' => new CustomerOrderResource($order),
        ], 201);
    }
}
