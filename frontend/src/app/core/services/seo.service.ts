import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private doc = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  public updateMetadata(config: SeoConfig): void {
    const fullTitle = `${config.title} | سامانه مدیریت دانش شهرداری اصفهان`;
    this.titleService.setTitle(fullTitle);

    this.metaService.updateTag({ name: 'description', content: config.description });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });

    // OpenGraph
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:type', content: config.type || 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: 'سامانه مدیریت دانش شهرداری اصفهان' });

    if (config.ogImage) {
      this.metaService.updateTag({ property: 'og:image', content: config.ogImage });
      this.metaService.updateTag({ name: 'twitter:image', content: config.ogImage });
    }

    // Twitter
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });

    // Canonical URL
    if (config.canonicalUrl && isPlatformBrowser(this.platformId)) {
      this.setCanonicalUrl(config.canonicalUrl);
    }
  }

  private setCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.doc.querySelector("link[rel='canonical']");
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  public setJsonLd(schema: Record<string, any>): void {
    if (isPlatformBrowser(this.platformId)) {
      let script: HTMLScriptElement | null = this.doc.querySelector("script[type='application/ld+json']");
      if (!script) {
        script = this.doc.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        this.doc.head.appendChild(script);
      }
      script.text = JSON.stringify(schema);
    }
  }
}
