<?php

namespace App\Http\Requests\Messages;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'content'=>'required_without:file|string|nullable|max:2000',
            'file' => 'nullable|file|max:10240',
            'type' => 'required|in:text,image,audio,file',
            'audio_duration' => 'nullable|integer',
        ];
    }
}
