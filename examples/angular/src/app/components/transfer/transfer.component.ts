import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule} from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-transfer',
  imports: [ReactiveFormsModule, AsyncPipe],
  templateUrl: './transfer.component.html',
  standalone: true,
  host: {
    'class': 'p-8 flex items-center justify-center bg-white'
  }
})
export class TransferComponent {
  
  protected user = inject(UserService);
  protected actor$ = this.user.actor$;

  readonly toControl = new FormControl<string>('', { nonNullable: true });
  readonly amountControl = new FormControl<string>('', { nonNullable: true });

  async transfer () {
    await this.user.transfer(
      this.toControl.value,
      this.amountControl.value,
    )
  }
}
