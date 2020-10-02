<?php

declare(strict_types=1);

namespace Bolt\Geolocation\Entity;

use Bolt\Entity\Field;
use Bolt\Entity\Field\Excerptable;
use Bolt\Entity\FieldInterface;
use Doctrine\ORM\Mapping as ORM;
use Twig\Markup;

/**
 * @ORM\Entity
 */
class GeolocationField extends Field implements Excerptable, FieldInterface
{
    public const TYPE = 'geolocation';

    /**
     * Override getTwigValue to render field as html
     */
    public function getTwigValue()
    {
        $value = parent::getTwigValue();

        return new Markup($value, 'UTF-8');
    }
}
