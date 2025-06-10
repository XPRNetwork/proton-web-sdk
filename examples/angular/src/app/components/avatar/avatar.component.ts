import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-avatar',
  imports: [AsyncPipe],
  templateUrl: './avatar.component.html',
  standalone: true,
})
export class AvatarComponent {

  protected user = inject(UserService);
  protected actor$ = this.user.actor$;
  protected avatar$ = this.user.avatar$;
  
  login () {
    this.user.login()
  }

  logout () {
    this.user.logout()
  }  
}
