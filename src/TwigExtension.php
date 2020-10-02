<?php

declare(strict_types=1);

namespace Bolt\Geolocation;

use Bolt\Common\Json;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

class TwigExtension extends AbstractExtension
{
    /** @var GeolocationConfig */
    private $geolocationConfig;

    public function __construct(GeolocationConfig $geolocationConfig)
    {
        $this->geolocationConfig = $geolocationConfig;
    }

    /**
     * This functions create a custom TWIG function `geolocation_settings()`
     *
     * @return TwigFunction[]
     */
    public function getFunctions(): array
    {
        $safe = [
            'is_safe' => ['html'],
        ];

        return [
            new TwigFunction('geolocation_settings', [$this, 'geolocationSettings'], $safe),
        ];
    }

    public function getFilters()
    {
        return [
            'geolocation_decode_json' => new TwigFilter('geolocation_decode_json', [$this, 'geolocationDecodeJson']),
        ];
    }

    public function geolocationSettings(): string
    {
        $settings = $this->geolocationConfig->getConfig();

        return Json::json_encode($settings, JSON_HEX_QUOT | JSON_HEX_APOS);
    }

    public function geolocationDecodeJson($str): object
    {
        if ($str === null) {
            return (object) [
                'selected' => null,
                'search' => null,
                'lat' => null,
                'long' => null,
                'zoom' => null,
            ];
        }

        return Json::json_decode($str);
    }
}
