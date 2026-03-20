<?php

namespace App\Http\Requests\Provider;

use Illuminate\Foundation\Http\FormRequest;

class ProviderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone_number' => 'nullable|string|max:30',
            'city' => 'nullable|string|max:120',
            'bio'=>'nullable|string',
            'hourly_rate'=>'nullable|decimal:2',
            'is_available'=>'nullable|boolean',
            'skills'=>'nullable|string',
            'birthday' => 'nullable|date|before:today',
            'picture' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ];
    }
}
