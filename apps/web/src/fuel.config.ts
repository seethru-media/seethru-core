import type { FuelLoaderConfig } from '@seethru/fuel-loader';
import path from 'path';

/**
 * Fuel Loader Configuration
 * Defines content sources for the web app
 */
export const fuelConfig: FuelLoaderConfig = {
    sources: [
        {
            id: 'example',
            subdomain: 'example',
            repository: 'https://github.com/seethru-media/fuel-example.git',
            // For local development, use the example fuel in this repo
            localPath: path.join(process.cwd(), '../../fuel-example'),
        },
    ],
    validate: true,
    useCache: false, // Disable caching in development
};
