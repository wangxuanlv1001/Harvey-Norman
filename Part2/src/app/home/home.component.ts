import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';   // 必须导入

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],          // 添加 RouterLink
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent { }