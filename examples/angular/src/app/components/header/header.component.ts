import { Component } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-header',
  imports: [AvatarComponent],
  templateUrl: './header.component.html',
  standalone: true,
  host: {
    'class': 'relative bg-white'
  }
})
export class HeaderComponent {

}
