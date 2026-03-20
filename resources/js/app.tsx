import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

if (import.meta.env.VITE_REVERB_APP_KEY) {
    const token = window.localStorage.getItem('access_token');

    configureEcho({
        broadcaster: 'reverb',
        auth: token
            ? {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              }
            : undefined,
    });
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        const bootLoading = document.getElementById('boot-loading');

        const hideBootLoading = () => {
            if (!bootLoading) return;

            bootLoading.classList.add('is-hidden');
            window.setTimeout(() => bootLoading.remove(), 320);
        };

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(hideBootLoading);
        });
    },
    progress: {
        color: '#f97316',
    },
});

// This will set light / dark mode on load...
initializeTheme();
