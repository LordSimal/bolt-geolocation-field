<?php

declare(strict_types=1);

namespace Bolt\Geolocation;

use Bolt\Extension\BaseExtension;
use Symfony\Component\Filesystem\Filesystem;

class Extension extends BaseExtension
{
    /**
     * The name of the extension in the backend (/bolt/extensions)
     * @return string
     */
    public function getName(): string
    {
        return 'Bolt Extension to add the Geolocation FieldType';
    }

    public function initialize(): void
    {
        $this->addTwigNamespace('geolocation');

        // This Injector Widget is used to insert CSS and JS for a field type
        // Therefore it is only inserted once even if you have multiple fields of this field type
        $this->addWidget(new GeolocationInjectorWidget());
    }

    /**
     * This function will copy all the files from /assets/ into the
     * /public/<extension-name>/ folder after it has been installed.
     *
     * If the user defines a different public directory the assets will
     * be copied to the custom public directory
     */
    public function install(): void
    {
        $projectDir = $this->getContainer()->getParameter('kernel.project_dir');
        $public = $this->getContainer()->getParameter('bolt.public_folder');

        $source = dirname(__DIR__) . '/assets/';
        $destination = $projectDir . '/' . $public . '/assets/';

        $filesystem = new Filesystem();
        $filesystem->mirror($source, $destination);
    }
}
