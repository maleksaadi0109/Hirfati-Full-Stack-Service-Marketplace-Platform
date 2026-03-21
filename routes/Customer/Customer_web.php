<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

 Route::get('/client/dashboard', function () {
        return Inertia::render('client/Dashboard');
})->name('client.dashboard');
   Route::get('/client/messages', function () {
        return Inertia::render('client/Messages');
    })->name('client.messages');

   Route::redirect('/client/message', '/client/messages');
  

     Route::get('/client/find-pros', function () {
         return Inertia::render('client/FindPros');
     })->name('client.find-pros');

     Route::get('/my-orders', function () {
         return Inertia::render('client/MyOrders');
     })->name('client.orders');

     Route::get('/client/my-orders', function () {
         return Inertia::render('client/MyOrders');
     })->name('client.my-orders');
 
      Route::get('/client/orders/{order}', function (string $orderId) {
          return Inertia::render('client/OrderDetails', [
              'orderId' => $orderId,
          ]);
      })->name('client.orders.show');

      Route::get('/client/profile', function () {
          return Inertia::render('client/Profile');
      })->name('client.profile');

     Route::get('/client/addresses/create', function () {
         return Inertia::render('client/AddressCreate');
     })->name('client.addresses.create');

     Route::get('/client/addresses/{address}/edit', function (string $address) {
         return Inertia::render('client/AddressEdit', [
             'addressId' => $address,
         ]);
     })->name('client.addresses.edit');

     Route::get('/client/explore', function () {
         return Inertia::render('client/ExplorePosts');
     })->name('client.explore');

     Route::get('/client/providers/{provider}', function (string $provider) {
         return Inertia::render('client/ProviderPosts', [
             'providerId' => $provider,
         ]);
     })->name('client.providers.show');

     Route::get('/client/providers/{provider}/book', function (string $provider) {
         return Inertia::render('client/BookService', [
             'providerId' => $provider,
         ]);
     })->name('client.providers.book');

     Route::get('/client/orders/{order}/success', function (string $order) {
         return Inertia::render('client/OrderSuccess', [
             'orderId' => $order,
         ]);
     })->name('client.orders.success');

     Route::get('/client/providers/{provider}/posts', function (string $provider) {
         return redirect()->route('client.providers.show', ['provider' => $provider]);
     })->name('client.providers.posts');
