import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';

// PrimeNG 19 Aura Theme Customized with Official Mandatory Brand Palette:
// Primary: #086288 | Secondary: #4D8DBA | Accent: #97D7FF | Highlight: #FFEFC4
const KMBrandPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f0f7fb',
      100: '#dcedf6',
      200: '#bcddeb',
      300: '#97d7ff', // Accent
      400: '#4d8dba', // Secondary
      500: '#086288', // Primary Dominant
      600: '#075577',
      700: '#064662',
      800: '#05384e',
      900: '#042e40',
      950: '#021e2b'
    },
    colorScheme: {
      light: {
        primary: {
          color: '#086288',
          inverseColor: '#ffffff',
          hoverColor: '#075577',
          activeColor: '#064662'
        },
        highlight: {
          background: '#FFEFC4',
          focusBackground: '#ffe6a4',
          color: '#172B3A',
          focusColor: '#172B3A'
        }
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: KMBrandPreset,
        options: {
          darkModeSelector: false,
          cssLayer: false
        }
      }
    })
  ]
};
