<?php

declare(strict_types=1);

namespace Bolt\Geolocation;

use Bolt\Extension\ExtensionRegistry;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;

class GeolocationConfig
{
    /** @var ExtensionRegistry */
    private $registry;

    /** @var CsrfTokenManagerInterface */
    private $csrfTokenManager;

    public function __construct(ExtensionRegistry $registry, CsrfTokenManagerInterface $csrfTokenManager)
    {
        $this->registry = $registry;
        $this->csrfTokenManager = $csrfTokenManager;
    }

    /**
     * Called by TwigExtension.php to
     * - merge default configs from bellow with the users custom config and
     * - pass them into the backend template
     */
    public function getConfig(): array
    {
        $extension = $this->registry->getExtension(Extension::class);

        return array_merge($this->getDefaults(), $extension->getConfig()['default']);
    }

    /**
     * Default configs which should always be present.
     */
    public function getDefaults(): array
    {
        return [
            '_csrf_token' => $this->csrfTokenManager->getToken('bolt_geolocation')
                ->getValue(),
        ];
    }
}
