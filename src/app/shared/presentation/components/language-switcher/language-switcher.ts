import { Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [MatButtonToggleModule],
  templateUrl: './language-switcher.html',
  styleUrls: ['./language-switcher.css'],
})
export class LanguageSwitcher {
  currentLang: string;
  languages = ['en', 'es'];

  constructor() {
    this.currentLang = 'en';
  }

  useLanguage(language: string) {
    this.currentLang = language;
  }
}
