import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrls: ['./language-switcher.css'],
})
export class LanguageSwitcher {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  readonly languages = ['en', 'es'] as const;
  readonly currentLanguage = signal<'en' | 'es'>('en');

  constructor() {
    this.translate.addLangs([...this.languages]);
    const savedLanguage = localStorage.getItem('language');
    const initialLanguage = savedLanguage === 'es' || savedLanguage === 'en' ? savedLanguage : 'en';
    this.useLanguage(initialLanguage);
  }

  useLanguage(language: 'en' | 'es'): void {
    this.currentLanguage.set(language);
    localStorage.setItem('language', language);
    this.document.documentElement.lang = language;
    this.translate.use(language).subscribe();
  }
}
