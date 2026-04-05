import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,   // 如果是独立组件
  templateUrl: './home.component.html',
  styles: [`
    .faq .question {
      background: #ecf0f1;
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      border-radius: 8px;
    }
    h3 {
      color: #2980b9;
    }
  `]
})
export class HomeComponent {
  // 组件逻辑
}