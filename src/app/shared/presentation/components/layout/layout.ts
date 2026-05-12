import { Component} from '@angular/core';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { Footer } from '../footer/footer';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-layout',
  imports: [
    MatSidenavContainer,
    MatToolbar,
    MatSidenav,
    MatSidenavContent,
    MatIcon,
    LanguageSwitcher,
    Footer,
    MatIconButton,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
