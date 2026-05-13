import { Component } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-layout',
  imports: [MatToolbar, MatButton, TranslateModule, LanguageSwitcher, Footer],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})

export class Layout {}
