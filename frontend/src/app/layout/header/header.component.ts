import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';
import { ThemeService } from '../../core/services/theme.service';
import { DirectionService } from '../../core/services/direction.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  protected i18n = inject(I18nService);
  protected theme = inject(ThemeService);
  protected direction = inject(DirectionService);

  public mobileMenuOpen = signal<boolean>(false);

  public toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }
}
