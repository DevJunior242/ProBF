<?php

namespace App\Services;

use Brevo\Brevo;
use Brevo\TransactionalEmails\Requests\SendTransacEmailRequest;
use Brevo\TransactionalEmails\Types\SendTransacEmailRequestSender;
use Brevo\TransactionalEmails\Types\SendTransacEmailRequestToItem;
use Illuminate\Support\Facades\Log;

class BrevoService
{
    public function send(string $toEmail, string $toName, string $subject, string $htmlContent)
    {
        $apiKey = config('services.brevo.key');

        if (! $apiKey) {
            Log::warning('Brevo skipped: no API key configured', ['to' => $toEmail]);

            return false;
        }

        try {
            $client = new Brevo(apiKey: $apiKey);

            return $client->transactionalEmails->sendTransacEmail(
                new SendTransacEmailRequest([
                    'htmlContent' => $htmlContent,
                    'sender' => new SendTransacEmailRequestSender([
                        'email' => config('mail.from.address'),
                        'name' => config('mail.from.name'),
                    ]),
                    'subject' => $subject,
                    'to' => [
                        new SendTransacEmailRequestToItem([
                            'email' => $toEmail,
                            'name' => $toName,
                        ]),
                    ],
                ])
            );
        } catch (\Throwable $e) {
            Log::error('Brevo error', [
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
