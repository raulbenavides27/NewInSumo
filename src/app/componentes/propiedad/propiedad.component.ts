import { Component, Input, OnInit } from '@angular/core';
import { Propiedad } from 'src/app/models';

@Component({
  selector: 'app-propiedad',
  templateUrl: './propiedad.component.html',
  styleUrls: ['./propiedad.component.scss'],
})
export class PropiedadComponent implements OnInit {
  @Input() propiedad!: Propiedad;

  ngOnInit() {
    console.log('detalles de propiedad: ', this.propiedad);
  }
}
