<?php

declare(strict_types=1);

namespace Bolt\Geolocation;

use Bolt\Common\Json;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class TwigExtension extends AbstractExtension
{
    /** @var GeolocationConfig */
    private $geolocationConfig;

    public function __construct(GeolocationConfig $geolocationConfig)
    {
        $this->geolocationConfig = $geolocationConfig;
    }

    public function getFunctions(): array
    {
        $safe = [
            'is_safe' => ['html'],
        ];

        return [
            new TwigFunction('geolocation_settings', [$this, 'geolocationSettings'], $safe),
        ];
    }

    public function geolocationSettings(): string
    {
        $settings = $this->geolocationConfig->getConfig();

        return Json::json_encode($settings, JSON_HEX_QUOT | JSON_HEX_APOS);
    }
}
