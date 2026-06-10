import { Component, Input, OnInit } from '@angular/core';
import { Cuentas } from 'src/app/models';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.scss'],
})
export class CuentaComponent implements OnInit {
  @Input() cuentas!: Cuentas;

  constructor() {}

  ngOnInit() {}
}
